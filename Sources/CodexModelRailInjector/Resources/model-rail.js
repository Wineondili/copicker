(() => {
  "use strict";

  const VERSION = "0.4.1";
  const GLOBAL_KEY = "__CODEX_MODEL_RAIL__";
  const LEGACY_HOST_ID = "codex-model-rail-host";
  const POPOVER_HOST_ID = "codex-model-rail-popover-host";
  const POPOVER_GAP = 12;
  const VIEWPORT_PADDING = 12;
  const TRIGGER_SELECTOR =
    '[data-codex-intelligence-trigger][data-composer-navigation-target="reasoning"]';
  const PRIMARY_SURFACE_SELECTOR = '[data-radix-menu-content], [role="menu"]';
  const REASONING_SLIDER_SELECTOR = "[data-reasoning-slider]";
  const PRIMARY_CONTROL_SELECTOR =
    "[data-model-picker-power-slider], [data-model-picker-view-toggle]";
  const SECONDARY_SURFACE_SELECTOR = "[data-composer-overlay-floating-ui]";
  const SECONDARY_ITEM_SELECTOR = "button[data-list-navigation-item]";

  const previous = window[GLOBAL_KEY];
  if (previous?.version === VERSION) {
    previous.sync();
    return {
      installed: true,
      reused: true,
      triggerFound: Boolean(previous.hasPrimaryTarget?.()),
      primaryOnly: true,
      secondaryExcluded: true,
      visualPending: true,
      version: VERSION,
    };
  }
  previous?.dispose?.();

  const state = {
    version: VERSION,
    observer: null,
    scheduled: false,
    trigger: null,
    primarySurface: null,
    popoverHost: null,
    resizeObserver: null,
    observedSurface: null,
  };

  function isVisible(element) {
    if (!(element instanceof Element) || !element.isConnected) return false;
    const style = getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function removePreviousVisual() {
    document.getElementById(LEGACY_HOST_ID)?.remove();
  }

  function removeDetachedPopover() {
    state.resizeObserver?.disconnect();
    state.popoverHost?.remove();
    document.getElementById(POPOVER_HOST_ID)?.remove();
    state.popoverHost = null;
    state.observedSurface = null;
  }

  function isSecondarySurface(surface) {
    return (
      surface.matches(SECONDARY_SURFACE_SELECTOR) ||
      Boolean(surface.closest(SECONDARY_SURFACE_SELECTOR)) ||
      Boolean(surface.querySelector(SECONDARY_ITEM_SELECTOR))
    );
  }

  function isSecondaryPickerOpen() {
    return [...document.querySelectorAll(SECONDARY_SURFACE_SELECTOR)].some(
      (surface) =>
        isVisible(surface) &&
        surface.querySelectorAll(SECONDARY_ITEM_SELECTOR).length >= 2,
    );
  }

  function isPrimarySurface(surface) {
    return (
      isVisible(surface) &&
      !isSecondarySurface(surface) &&
      Boolean(surface.querySelector(REASONING_SLIDER_SELECTOR)) &&
      Boolean(surface.querySelector(PRIMARY_CONTROL_SELECTOR))
    );
  }

  function findOpenTrigger() {
    return [...document.querySelectorAll(TRIGGER_SELECTOR)].find(
      (trigger) =>
        isVisible(trigger) &&
        (trigger.getAttribute("aria-expanded") === "true" ||
          trigger.getAttribute("data-state") === "open"),
    );
  }

  function findPrimarySurface(trigger) {
    if (!trigger) return null;

    const controlledID = trigger.getAttribute("aria-controls");
    if (controlledID) {
      const controlled = document.getElementById(controlledID);
      if (controlled && isPrimarySurface(controlled)) return controlled;
    }

    const candidates = [...document.querySelectorAll(PRIMARY_SURFACE_SELECTOR)]
      .filter(isPrimarySurface);
    if (candidates.length === 0) return null;

    const triggerRect = trigger.getBoundingClientRect();
    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    const triggerCenterY = triggerRect.top + triggerRect.height / 2;
    return candidates.sort((left, right) => {
      const leftRect = left.getBoundingClientRect();
      const rightRect = right.getBoundingClientRect();
      const leftDistance = Math.hypot(
        leftRect.left + leftRect.width / 2 - triggerCenterX,
        leftRect.top + leftRect.height / 2 - triggerCenterY,
      );
      const rightDistance = Math.hypot(
        rightRect.left + rightRect.width / 2 - triggerCenterX,
        rightRect.top + rightRect.height / 2 - triggerCenterY,
      );
      return leftDistance - rightDistance;
    })[0];
  }

  function currentPrimaryTarget() {
    if (isSecondaryPickerOpen()) return null;
    const trigger = findOpenTrigger();
    const surface = findPrimarySurface(trigger);
    return surface ? { trigger, surface } : null;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  }

  function overlaps(left, right) {
    return !(
      left.right <= right.left ||
      left.left >= right.right ||
      left.bottom <= right.top ||
      left.top >= right.bottom
    );
  }

  function computePlacement(anchorRect, popoverWidth, popoverHeight) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    if (
      popoverWidth > viewportWidth - VIEWPORT_PADDING * 2 ||
      popoverHeight > viewportHeight - VIEWPORT_PADDING * 2
    ) {
      return null;
    }

    const centeredY = clamp(
      anchorRect.top + (anchorRect.height - popoverHeight) / 2,
      VIEWPORT_PADDING,
      viewportHeight - VIEWPORT_PADDING - popoverHeight,
    );
    const centeredX = clamp(
      anchorRect.left + (anchorRect.width - popoverWidth) / 2,
      VIEWPORT_PADDING,
      viewportWidth - VIEWPORT_PADDING - popoverWidth,
    );
    const candidates = [
      {
        placement: "left",
        x: anchorRect.left - POPOVER_GAP - popoverWidth,
        y: centeredY,
      },
      {
        placement: "right",
        x: anchorRect.right + POPOVER_GAP,
        y: centeredY,
      },
      {
        placement: "bottom",
        x: centeredX,
        y: anchorRect.bottom + POPOVER_GAP,
      },
      {
        placement: "top",
        x: centeredX,
        y: anchorRect.top - POPOVER_GAP - popoverHeight,
      },
    ];

    for (const candidate of candidates) {
      const rect = {
        left: candidate.x,
        top: candidate.y,
        right: candidate.x + popoverWidth,
        bottom: candidate.y + popoverHeight,
      };
      const withinViewport =
        rect.left >= VIEWPORT_PADDING &&
        rect.top >= VIEWPORT_PADDING &&
        rect.right <= viewportWidth - VIEWPORT_PADDING &&
        rect.bottom <= viewportHeight - VIEWPORT_PADDING;
      if (withinViewport && !overlaps(rect, anchorRect)) {
        return { ...candidate, width: popoverWidth, height: popoverHeight };
      }
    }

    return null;
  }

  function ensureDetachedPopover() {
    let host = document.getElementById(POPOVER_HOST_ID);
    if (!host) {
      host = document.createElement("div");
      host.id = POPOVER_HOST_ID;
    }

    host.setAttribute("data-codex-model-rail-popover", VERSION);
    host.setAttribute("data-visual-pending", "true");
    host.setAttribute("aria-hidden", "true");
    host.style.position = "fixed";
    host.style.left = "0px";
    host.style.top = "0px";
    host.style.margin = "0";
    host.style.pointerEvents = "none";
    host.style.visibility = "hidden";
    host.style.zIndex = "2147483000";

    if (host.parentElement !== document.body) document.body.append(host);
    state.popoverHost = host;
    return host;
  }

  function positionDetachedPopover() {
    const host = state.popoverHost;
    const surface = state.primarySurface;
    if (!host?.isConnected || !surface?.isConnected) return;

    const anchorRect = surface.getBoundingClientRect();
    const hostRect = host.getBoundingClientRect();
    const placement = computePlacement(anchorRect, hostRect.width, hostRect.height);
    if (!placement) {
      host.setAttribute("data-placement", "none");
      host.setAttribute("data-position-state", "hidden-no-fit");
      host.style.left = "-100000px";
      host.style.top = "-100000px";
      return;
    }

    host.setAttribute("data-placement", placement.placement);
    host.setAttribute("data-position-state", "positioned");
    host.style.left = `${Math.round(placement.x)}px`;
    host.style.top = `${Math.round(placement.y)}px`;
  }

  function syncNow() {
    state.scheduled = false;
    removePreviousVisual();

    const target = currentPrimaryTarget();
    state.trigger = target?.trigger ?? null;
    state.primarySurface = target?.surface ?? null;

    if (!target) {
      removeDetachedPopover();
      return;
    }

    const host = ensureDetachedPopover();
    if (state.observedSurface !== target.surface) {
      state.resizeObserver?.disconnect();
      state.resizeObserver = new ResizeObserver(scheduleSync);
      state.resizeObserver.observe(target.surface);
      state.resizeObserver.observe(host);
      state.observedSurface = target.surface;
    }
    positionDetachedPopover();

    // The detached scaffold is intentionally invisible until the user supplies its design.
  }

  function scheduleSync() {
    if (state.scheduled) return;
    state.scheduled = true;
    requestAnimationFrame(syncNow);
  }

  state.observer = new MutationObserver(scheduleSync);
  state.observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["aria-expanded", "aria-controls", "data-state", "hidden"],
  });

  state.sync = scheduleSync;
  state.hasPrimaryTarget = () => Boolean(currentPrimaryTarget());
  state.getAnchorSurface = () => state.primarySurface;
  state.getPopoverHost = () => state.popoverHost;
  state.previewPlacement = (width, height) => {
    if (!state.primarySurface) return null;
    return computePlacement(state.primarySurface.getBoundingClientRect(), width, height);
  };
  state.dispose = () => {
    state.observer?.disconnect();
    window.removeEventListener("resize", scheduleSync);
    window.removeEventListener("scroll", scheduleSync, true);
    removeDetachedPopover();
    removePreviousVisual();
    state.trigger = null;
    state.primarySurface = null;
    if (window[GLOBAL_KEY] === state) delete window[GLOBAL_KEY];
  };

  window.addEventListener("resize", scheduleSync);
  window.addEventListener("scroll", scheduleSync, true);
  window[GLOBAL_KEY] = state;
  scheduleSync();

  return {
    installed: true,
    reused: false,
    triggerFound: Boolean(currentPrimaryTarget()),
    primaryOnly: true,
    secondaryExcluded: true,
    visualPending: true,
    version: VERSION,
  };
})();
