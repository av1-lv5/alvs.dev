import { isVisitorId, readLikeState, type LikeState } from "@/lib/likes";

const STORAGE_KEY = "portfolio-likes";
const LEGACY_PREFIX = "portfolio-like:";
const VISITOR_KEY = "portfolio-visitor-id";
export const LIKE_STORAGE_KEY = STORAGE_KEY;
export const LIKES_UPDATED_EVENT = "portfolio:likes-updated";

interface LikeStorage {
  visitorId: string;
  items: Record<string, LikeState>;
}

// Read only: list pages should not create a visitor ID or migrate storage.
export function readConfirmedLikes(): Record<string, number> {
  const counts: Record<string, number> = Object.create(null);
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw !== null) {
    const data = JSON.parse(raw) as LikeStorage;
    if (!data || typeof data.items !== "object" || !data.items) return counts;
    for (const [key, value] of Object.entries(data.items)) {
      const state = readLikeState(JSON.stringify(value));
      if (state) counts[key] = state.confirmed;
    }
  }
  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if (!key?.startsWith(LEGACY_PREFIX) || key.endsWith(":pending")) continue;
    const item = key.slice(LEGACY_PREFIX.length);
    if (Object.hasOwn(counts, item)) continue;
    const state = readLikeState(localStorage.getItem(key));
    if (state) counts[item] = state.confirmed;
  }
  return counts;
}

// Web Locks serialize read-modify-write operations across tabs. Older browsers
// without Web Locks still work, but cannot guarantee cross-tab serialization.
function withStorageLock<T>(callback: () => T): Promise<T> {
  if (navigator.locks) return navigator.locks.request(STORAGE_KEY, callback);
  return Promise.resolve().then(callback);
}

function readStorage(): LikeStorage {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    const legacyId = localStorage.getItem(VISITOR_KEY);
    return {
      visitorId: isVisitorId(legacyId) ? legacyId : crypto.randomUUID(),
      items: {},
    };
  }
  const value: unknown = JSON.parse(raw);
  if (
    !value ||
    typeof value !== "object" ||
    !isVisitorId((value as LikeStorage).visitorId) ||
    !(value as LikeStorage).items ||
    typeof (value as LikeStorage).items !== "object" ||
    Array.isArray((value as LikeStorage).items)
  ) {
    throw new Error("Invalid like storage");
  }
  return value as LikeStorage;
}

export function initializeLikeStorage(itemKey: string): Promise<LikeState> {
  return withStorageLock(() => {
    const data = readStorage();
    const migrated: string[] = [];
    const keys = Array.from({ length: localStorage.length }, (_, index) =>
      localStorage.key(index),
    );
    for (const key of keys) {
      if (!key?.startsWith(LEGACY_PREFIX) || key.endsWith(":pending")) continue;
      const item = key.slice(LEGACY_PREFIX.length);
      const previous = readLikeState(localStorage.getItem(key));
      const pendingKey = `${key}:pending`;
      const pending = localStorage.getItem(pendingKey);
      if (!previous && !isVisitorId(pending)) continue;
      const legacyState =
        previous && previous.revision > 0
          ? previous
          : isVisitorId(pending)
            ? {
                visitorId: pending,
                count: 1,
                confirmed: 0,
                revision: 1,
                confirmedRevision: 0,
                requestPending: true,
              }
            : null;
      if (legacyState && !Object.hasOwn(data.items, item))
        data.items[item] = legacyState;
      migrated.push(key);
      if (isVisitorId(pending)) migrated.push(pendingKey);
    }
    // Older versions could leave a pending key without a corresponding item.
    for (const key of keys) {
      if (
        !key?.startsWith(LEGACY_PREFIX) ||
        !key.endsWith(":pending") ||
        migrated.includes(key)
      )
        continue;
      const pending = localStorage.getItem(key);
      if (!isVisitorId(pending)) continue;
      const item = key.slice(LEGACY_PREFIX.length, -":pending".length);
      if (!Object.hasOwn(data.items, item)) {
        data.items[item] = {
          visitorId: pending,
          count: 1,
          confirmed: 0,
          revision: 1,
          confirmedRevision: 0,
          requestPending: true,
        };
      }
      migrated.push(key);
    }
    const stored = Object.hasOwn(data.items, itemKey)
      ? readLikeState(JSON.stringify(data.items[itemKey]))
      : null;
    if (Object.hasOwn(data.items, itemKey) && !stored)
      throw new Error("Invalid like state");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    for (const key of migrated) localStorage.removeItem(key);
    localStorage.removeItem(VISITOR_KEY);
    return (
      stored ?? {
        visitorId: data.visitorId,
        count: 0,
        confirmed: 0,
        revision: 0,
        confirmedRevision: 0,
        requestPending: false,
      }
    );
  });
}

export function persistLikeState(
  itemKey: string,
  state: LikeState,
): Promise<void> {
  const snapshot = { ...state };
  return withStorageLock(() => {
    const data = readStorage();
    data.items[itemKey] = snapshot;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event(LIKES_UPDATED_EVENT));
  });
}
