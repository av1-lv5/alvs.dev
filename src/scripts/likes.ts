import { initializeLikeStorage, persistLikeState } from "@/lib/like-storage";
import type { LikeState } from "@/lib/likes";
import { LIKE_SAVE_DELAY_MS, MAX_LIKES } from "@/constants/likes";

export async function initLikes(container: HTMLElement) {
  if (container.dataset.initialized) return;
  container.dataset.initialized = "true";
  container.dataset.animate = "false";
  const button = container.querySelector<HTMLButtonElement>(".like-trigger")!;
  const heart = container.querySelector<HTMLElement>(".like-heart-wrap")!;
  const ripples = container.querySelectorAll<HTMLElement>(".like-ripple");
  const particles = container.querySelectorAll<HTMLElement>(".like-particle");
  const feedback = container.querySelector<HTMLElement>(".like-feedback")!;
  const labels = feedback.querySelectorAll<HTMLElement>(".like-label");
  const errorLabel = feedback.querySelector<HTMLElement>(
    '[data-label="error"]',
  )!;
  const announcement =
    container.querySelector<HTMLElement>(".like-announcement")!;
  const { type, id } = container.dataset;
  const item = type === "notes" ? "note" : type === "labs" ? "lab" : "project";
  const key = `${type}:${id}`;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let state: LikeState;
  let saving = false;
  let failed = false;
  let saveTimer: ReturnType<typeof setTimeout> | undefined;
  let animations: Animation[] = [];

  const setFeedback = (message: string) => {
    const labelState =
      message === "Leave a little love"
        ? "idle"
        : message === "Liked"
          ? "liked"
          : message === "Loved it"
            ? "loved"
            : "error";
    if (labelState === "error") errorLabel.textContent = message;
    labels.forEach((label) =>
      label.classList.toggle("is-current", label.dataset.label === labelState),
    );
    if (
      labelState !== "error" &&
      (reducedMotion.matches || container.dataset.animate === "false")
    ) {
      errorLabel.textContent = "";
    }
    const count = Number(container.dataset.count);
    const action = failed
      ? "Retry saving your like."
      : count >= MAX_LIKES
        ? `Remove your three likes from this ${item}.`
        : `Like this ${item}. ${count} of ${MAX_LIKES} likes given.`;
    button.setAttribute(
      "aria-label",
      `${message.replace(/[.!?]$/, "")}. ${action}`,
    );
  };

  // Release a long error message's layout space once it has crossfaded out.
  errorLabel.addEventListener("transitionend", (event) => {
    if (
      event.propertyName === "opacity" &&
      !errorLabel.classList.contains("is-current")
    )
      errorLabel.textContent = "";
  });

  const labelForCount = (count: number) =>
    count === 0
      ? "Leave a little love"
      : count === MAX_LIKES
        ? "Loved it"
        : "Liked";

  const notify = (message: string, accessibleMessage = message) => {
    setFeedback(message);
    announcement.textContent = accessibleMessage;
  };

  const render = () => {
    const count = failed ? state.confirmed : state.count;
    container.dataset.count = String(count);
    button.title = failed
      ? "Retry saving your like"
      : count >= MAX_LIKES
        ? "Tap to remove your likes"
        : `Leave a little love`;
    if (!failed) setFeedback(labelForCount(count));
  };

  const persist = () => persistLikeState(key, state);

  const confirmUnchanged = () => {
    if (!state.requestPending && state.count === state.confirmed) {
      state.confirmedRevision = state.revision;
    }
  };

  const clearSaveTimer = () => {
    clearTimeout(saveTimer);
    saveTimer = undefined;
  };

  try {
    state = await initializeLikeStorage(key);
    confirmUnchanged();
    render();
    button.disabled = false;
  } catch {
    button.title = "Likes need browser storage to work";
    notify("Likes need browser storage.");
    return;
  }

  const stopAnimations = () => {
    animations.forEach((animation) => animation.cancel());
    animations = [];
  };

  const animate = (count: number) => {
    const shouldAnimate = !reducedMotion.matches;
    container.dataset.animate = String(shouldAnimate);
    const currentTransform = shouldAnimate
      ? getComputedStyle(heart).transform
      : "none";
    stopAnimations();
    if (!shouldAnimate) return;
    animations.push(
      heart.animate(
        [
          { transform: currentTransform },
          {
            transform:
              count === 0
                ? "scale(0.92)"
                : `scale(${count === MAX_LIKES ? 1.22 : 1.18})`,
            offset: 0.35,
          },
          { transform: "translateY(0) scale(1) rotate(0deg)" },
        ],
        {
          duration: count === 0 ? 180 : 280,
          easing: "cubic-bezier(0.23, 1, 0.32, 1)",
        },
      ),
    );
    if (count > 0)
      ripples.forEach((ripple, index) => {
        animations.push(
          ripple.animate(
            [
              {
                transform: "scale(0.78)",
                opacity: 0.44 * (index === 0 ? 1 : 0.65),
              },
              { transform: `scale(${1.36 + (count - 1) * 0.04})`, opacity: 0 },
            ],
            {
              duration: 300,
              delay: index * 65,
              easing: "cubic-bezier(0.23, 1, 0.32, 1)",
            },
          ),
        );
      });
    if (count === MAX_LIKES)
      particles.forEach((particle) => {
        const { drift, rise, tilt, delay } = particle.dataset;
        animations.push(
          particle.animate(
            [
              { transform: "translate(0, 0) scale(0.9)", opacity: 0 },
              { opacity: 0.85, offset: 0.15 },
              {
                transform: `translate(${drift}px, ${rise}px) rotate(${tilt}deg) scale(0.95)`,
                opacity: 0,
              },
            ],
            {
              duration: 720,
              delay: Number(delay),
              fill: "backwards",
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            },
          ),
        );
      });
  };

  reducedMotion.addEventListener("change", () => {
    if (!reducedMotion.matches) return;
    container.dataset.animate = "false";
    stopAnimations();
    if (!errorLabel.classList.contains("is-current"))
      errorLabel.textContent = "";
  });

  const save = async () => {
    if (saving || state.confirmedRevision >= state.revision) return;
    saving = true;
    let errorMessage = "Couldn’t save. Tap to retry.";
    try {
      const { count, revision } = state;
      // Persist before sending so a reload or lost response cannot make an
      // uncertain write look like a safe, unsent no-op.
      state.requestPending = true;
      await persist();
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          id,
          visitorId: state.visitorId,
          count,
          revision,
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) {
        if (response.status === 429) {
          const error = await response.json().catch(() => null);
          errorMessage =
            error?.error === "daily_limit"
              ? "Daily like limit reached. Try tomorrow."
              : "Too many requests. Try again shortly.";
        }
        throw new Error("Request failed");
      }
      const result = await response.json();
      if (
        !Number.isInteger(result.count) ||
        result.count < 0 ||
        result.count > MAX_LIKES ||
        !Number.isInteger(result.revision) ||
        result.revision < revision ||
        result.revision > 2147483647
      ) {
        throw new Error("Invalid response");
      }
      state.confirmed = result.count;
      state.confirmedRevision = result.revision;
      state.requestPending = false;
      if (result.revision >= state.revision) {
        state.count = result.count;
        state.revision = result.revision;
      }
      confirmUnchanged();
      await persist();
      render();
      if (state.confirmedRevision === state.revision) {
        clearSaveTimer();
        notify(
          labelForCount(state.confirmed),
          state.confirmed === 0
            ? "Your likes were removed."
            : `${state.confirmed} of ${MAX_LIKES} likes saved. Thank you!`,
        );
      }
    } catch {
      failed = true;
      clearSaveTimer();
      stopAnimations();
      render();
      notify(errorMessage);
    } finally {
      saving = false;
      // A debounce can expire while a request is in flight. Send the latest
      // intent only after that request finishes and the click delay has elapsed.
      if (
        !failed &&
        saveTimer === undefined &&
        state.confirmedRevision < state.revision
      ) {
        void save();
      }
    }
  };

  const queueSave = () => {
    clearSaveTimer();
    if (state.confirmedRevision >= state.revision) return;
    saveTimer = setTimeout(() => {
      saveTimer = undefined;
      void save();
    }, LIKE_SAVE_DELAY_MS);
  };

  button.addEventListener("click", async () => {
    container.dataset.animate = String(!reducedMotion.matches);
    const previousCount = state.count;
    const previousRevision = state.revision;
    const previousConfirmedRevision = state.confirmedRevision;
    if (!failed) {
      state.count = (state.count + 1) % (MAX_LIKES + 1);
      state.revision += 1;
    }
    confirmUnchanged();
    try {
      await persist();
    } catch {
      state.count = previousCount;
      state.revision = previousRevision;
      state.confirmedRevision = previousConfirmedRevision;
      notify("Couldn’t save. Check browser storage.");
      return;
    }
    failed = false;
    render();
    animate(state.count);
    queueSave();
  });

  // Resume unsent changes with the same debounce. Uncertain writes must be
  // reconciled even if the desired count now matches the last confirmed count.
  if (state.revision > state.confirmedRevision) {
    if (state.requestPending) void save();
    else queueSave();
  }
}
