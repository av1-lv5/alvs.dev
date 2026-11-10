import { MAX_LIKES } from "@/constants/likes";

export interface LikeState {
  visitorId: string;
  count: number;
  confirmed: number;
  revision: number;
  confirmedRevision: number;
  requestPending: boolean;
}

export function isVisitorId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

// Preserve the one-like identifier used by the previous toggle UI.
export function readLikeState(value: unknown): LikeState | null {
  if (isVisitorId(value))
    return {
      visitorId: value,
      count: 1,
      confirmed: 1,
      revision: 1,
      confirmedRevision: 1,
      requestPending: false,
    };
  if (typeof value !== "string") return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== "object" || parsed === null) return null;
    const state = parsed as Record<string, unknown>;
    const revision = state.revision ?? state.count;
    const confirmedRevision = state.confirmedRevision ?? state.confirmed;
    // Older pending writes may already have reached the server. Reconcile them
    // conservatively rather than treating them as an unsent debounced change.
    const requestPending =
      state.requestPending === undefined
        ? revision !== confirmedRevision
        : state.requestPending;
    if (
      isVisitorId(state.visitorId) &&
      typeof state.count === "number" &&
      Number.isInteger(state.count) &&
      state.count >= 0 &&
      state.count <= MAX_LIKES &&
      typeof state.confirmed === "number" &&
      Number.isInteger(state.confirmed) &&
      state.confirmed >= 0 &&
      state.confirmed <= MAX_LIKES &&
      typeof revision === "number" &&
      Number.isInteger(revision) &&
      revision >= 0 &&
      revision <= 2147483647 &&
      typeof confirmedRevision === "number" &&
      Number.isInteger(confirmedRevision) &&
      confirmedRevision >= 0 &&
      confirmedRevision <= revision &&
      typeof requestPending === "boolean" &&
      (!requestPending || confirmedRevision < revision) &&
      (confirmedRevision !== revision || state.confirmed === state.count)
    ) {
      return {
        visitorId: state.visitorId,
        count: state.count,
        confirmed: state.confirmed,
        revision,
        confirmedRevision,
        requestPending,
      };
    }
  } catch {
    // Unavailable or malformed storage must not break the page.
  }
  return null;
}
