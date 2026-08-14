(() => {
  "use strict";

  const VERSION = "0.5.0";
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
  const PROTOTYPE_MODELS = [
    "5.6 Sol",
    "5.6 Terra",
    "5.6 Luna",
    "5.5",
    "5.4",
    "5.4 Mini",
    "5.3 Spark",
  ];

  const previous = window[GLOBAL_KEY];
  if (previous?.version === VERSION) {
    previous.sync();
    return {
      installed: true,
      reused: true,
      triggerFound: Boolean(previous.hasPrimaryTarget?.()),
      primaryOnly: true,
      secondaryExcluded: true,
      prototype: true,
      visualPending: false,
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
    dismissedForCurrentOpen: false,
    prototypeSelection: "5.6 Sol",
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
    if (!trigger) {
      state.dismissedForCurrentOpen = false;
      return null;
    }
    if (state.dismissedForCurrentOpen) return null;
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

  function selectPrototypeModel(host, label) {
    state.prototypeSelection = label;
    host.setAttribute("data-prototype-selection", label);
    for (const button of host.shadowRoot?.querySelectorAll("button[data-model-label]") || []) {
      button.setAttribute(
        "aria-pressed",
        button.getAttribute("data-model-label") === label ? "true" : "false",
      );
    }
    const status = host.shadowRoot?.querySelector("[data-selection-status]");
    if (status) status.textContent = `本地选中：${label}`;
  }

  function renderPrototype(host) {
    if (host.shadowRoot) return;
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host {
          all: initial;
          display: block;
          width: 304px;
          color-scheme: dark;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
        }

        * { box-sizing: border-box; }

        .panel {
          width: 304px;
          padding: 12px;
          color: #f1f1f3;
          background: #1d1d20;
          border: 1px solid #3b3b40;
          border-radius: 14px;
          box-shadow: 0 14px 38px rgba(0, 0, 0, 0.34);
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 0 2px 10px;
        }

        .title {
          font-size: 13px;
          font-weight: 650;
          letter-spacing: -0.01em;
        }

        .tag {
          color: #919198;
          font-size: 10px;
          font-weight: 550;
        }

        .models {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 6px;
        }

        button {
          appearance: none;
          min-width: 0;
          min-height: 36px;
          padding: 7px 9px;
          overflow: hidden;
          color: #d3d3d7;
          background: #28282c;
          border: 1px solid #38383d;
          border-radius: 9px;
          font: inherit;
          font-size: 12px;
          font-weight: 560;
          text-align: left;
          text-overflow: ellipsis;
          white-space: nowrap;
          cursor: default;
          transition: background 100ms ease, border-color 100ms ease, transform 80ms ease;
        }

        button:hover {
          color: #ffffff;
          background: #323237;
          border-color: #4b4b52;
        }

        button:active { transform: scale(0.975); }

        button[aria-pressed="true"] {
          color: #171719;
          background: #f0f0f2;
          border-color: #f0f0f2;
        }

        button:focus-visible {
          outline: 2px solid #8e8e96;
          outline-offset: 2px;
        }

        .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          min-height: 16px;
          margin: 10px 2px 0;
          color: #8e8e95;
          font-size: 10px;
        }

        [data-selection-status] {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @media (prefers-reduced-motion: reduce) {
          button { transition: none; }
        }
      </style>
      <section class="panel" data-prototype="true" aria-label="临时快捷模型交互稿">
        <div class="header">
          <span class="title">快捷模型</span>
          <span class="tag">临时交互稿</span>
        </div>
        <div class="models"></div>
        <div class="footer">
          <span data-selection-status></span>
          <span>不切换真实模型</span>
        </div>
      </section>
    `;

    const models = shadow.querySelector(".models");
    for (const label of PROTOTYPE_MODELS) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.setAttribute("data-model-label", label);
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        selectPrototypeModel(host, label);
      });
      models?.append(button);
    }

    shadow.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
    shadow.addEventListener("click", (event) => event.stopPropagation());
    selectPrototypeModel(host, state.prototypeSelection);
  }

  function ensureDetachedPopover() {
    let host = document.getElementById(POPOVER_HOST_ID);
    if (!host) {
      host = document.createElement("div");
      host.id = POPOVER_HOST_ID;
    }

    host.setAttribute("data-codex-model-rail-popover", VERSION);
    host.setAttribute("data-prototype", "true");
    host.setAttribute("data-visual-pending", "false");
    host.setAttribute("aria-hidden", "true");
    host.style.position = "fixed";
    host.style.left = "0px";
    host.style.top = "0px";
    host.style.margin = "0";
    host.style.pointerEvents = "none";
    host.style.visibility = "hidden";
    host.style.zIndex = "2147483000";

    if (host.parentElement !== document.body) document.body.append(host);
    renderPrototype(host);
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
      host.setAttribute("aria-hidden", "true");
      host.style.left = "-100000px";
      host.style.top = "-100000px";
      host.style.pointerEvents = "none";
      host.style.visibility = "hidden";
      return;
    }

    host.setAttribute("data-placement", placement.placement);
    host.setAttribute("data-position-state", "positioned");
    host.setAttribute("aria-hidden", "false");
    host.style.left = `${Math.round(placement.x)}px`;
    host.style.top = `${Math.round(placement.y)}px`;
    host.style.pointerEvents = "auto";
    host.style.visibility = "visible";
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

    // This is a disposable visual prototype. It does not change the real Codex model.
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
  state.dismissForCurrentOpen = () => {
    state.dismissedForCurrentOpen = true;
    removeDetachedPopover();
  };
  state.handleWindowBlur = () => state.dismissForCurrentOpen();
  state.handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") state.dismissForCurrentOpen();
  };
  state.handleKeyDown = (event) => {
    if (event.key === "Escape") state.dismissForCurrentOpen();
  };
  state.dispose = () => {
    state.observer?.disconnect();
    window.removeEventListener("resize", scheduleSync);
    window.removeEventListener("scroll", scheduleSync, true);
    window.removeEventListener("blur", state.handleWindowBlur);
    document.removeEventListener("visibilitychange", state.handleVisibilityChange);
    document.removeEventListener("keydown", state.handleKeyDown, true);
    removeDetachedPopover();
    removePreviousVisual();
    state.trigger = null;
    state.primarySurface = null;
    if (window[GLOBAL_KEY] === state) delete window[GLOBAL_KEY];
  };

  window.addEventListener("resize", scheduleSync);
  window.addEventListener("scroll", scheduleSync, true);
  window.addEventListener("blur", state.handleWindowBlur);
  document.addEventListener("visibilitychange", state.handleVisibilityChange);
  document.addEventListener("keydown", state.handleKeyDown, true);
  window[GLOBAL_KEY] = state;
  scheduleSync();

  return {
    installed: true,
    reused: false,
    triggerFound: Boolean(currentPrimaryTarget()),
    primaryOnly: true,
    secondaryExcluded: true,
    prototype: true,
    visualPending: false,
    version: VERSION,
  };
})();
