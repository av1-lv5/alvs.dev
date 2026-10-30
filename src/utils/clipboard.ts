export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to legacy path
    }
  }

  // Legacy fallback — works on insecure origins (e.g. LAN dev over http)
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand("copy");
    textarea.remove();
    return ok;
  } catch {
    return false;
  }
}

export function setupCopyButton(button: HTMLButtonElement): void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  button.addEventListener("click", async () => {
    const email = button.dataset.email!;
    const successMsg = button.dataset.success!;
    const wrapper = button.closest<HTMLElement>(".tooltip-wrapper")!;
    const tooltip = wrapper.querySelector<HTMLElement>(".tooltip-text")!;
    const ok = await copyToClipboard(email);

    if (timeout) clearTimeout(timeout);

    button.classList.add("copied");
    wrapper.classList.add("show-tooltip", "tooltip-success");
    tooltip.textContent = ok
      ? successMsg
      : "Couldn't copy. Please copy manually.";

    timeout = setTimeout(() => {
      button.classList.remove("copied");
      wrapper.classList.remove("show-tooltip", "tooltip-success");
      // Reset text after the fade-out so "Click to copy" doesn't flash
      setTimeout(() => {
        tooltip.textContent = "Click to copy";
      }, 200);
      timeout = null;
    }, 2000);
  });
}
