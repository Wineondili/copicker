(() => {
  "use strict";

  const VERSION = "0.1.0";
  const GLOBAL_KEY = "__CODEX_MODEL_RAIL__";
  const HOST_ID = "codex-model-rail-host";
  const TRIGGER_SELECTOR = "[data-codex-intelligence-trigger]";
  const MODEL_ROW_SELECTOR = "[data-model-picker-model-row]";
  const OFFICIAL_ITEM_SELECTOR = '[role="menuitem"], [role="option"]';

  const previous = window[GLOBAL_KEY];
  if (previous?.version === VERSION) {
    previous.sync();
    return {
      installed: true,
      reused: true,
      triggerFound: Boolean(document.querySelector(TRIGGER_SELECTOR)),
      version: VERSION,
    };
  }
  previous?.dispose?.();

  const state = {
    version: VERSION,
    host: null,
    shadow: null,
    trigger: null,
    surface: null,
    observer: null,
    keyboardHandler: null,
    scheduled: false,
    requestedModels: false,
    baselineItems: new Set(),
    candidates: [],
    timers: new Set(),
  };

  function isVisible(element) {
    if (!(element instanceof Element) || !element.isConnected) return false;
    const style = getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function cleanLabel(value) {
    return String(value ?? "")
      .replace(/\s+/g, " ")
      .replace(/[✓✔]+$/u, "")
      .trim();
  }

  function labelFor(element) {
    const ariaLabel = cleanLabel(element.getAttribute("aria-label"));
    if (ariaLabel) return ariaLabel.slice(0, 64);

    const lines = String(element.innerText ?? element.textContent ?? "")
      .split("\n")
      .map(cleanLabel)
      .filter(Boolean);
    return (lines[0] ?? "").slice(0, 64);
  }

  function isPickerOpen(trigger) {
    return (
      trigger?.getAttribute("aria-expanded") === "true" ||
      trigger?.getAttribute("data-state") === "open"
    );
  }

  function officialItems() {
    return [...document.querySelectorAll(OFFICIAL_ITEM_SELECTOR)].filter(
      (element) => !state.host?.contains(element) && isVisible(element),
    );
  }

  function nearestPickerSurface(trigger) {
    const controlledID = trigger.getAttribute("aria-controls");
    if (controlledID) {
      const controlled = document.getElementById(controlledID);
      if (controlled && isVisible(controlled)) return controlled;
    }

    const menus = [...document.querySelectorAll('[role="menu"]')].filter(isVisible);
    if (menus.length === 0) return null;

    const triggerRect = trigger.getBoundingClientRect();
    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    const triggerCenterY = triggerRect.top + triggerRect.height / 2;

    return menus.sort((left, right) => {
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

  function clearTimers() {
    for (const timer of state.timers) clearTimeout(timer);
    state.timers.clear();
  }

  function removeHost() {
    state.host?.remove();
    state.host = null;
    state.shadow = null;
    state.surface = null;
  }

  function resetPickerSession() {
    clearTimers();
    removeHost();
    state.requestedModels = false;
    state.baselineItems = new Set();
    state.candidates = [];
  }

  function createHost(surface) {
    removeHost();

    const host = document.createElement("div");
    host.id = HOST_ID;
    host.setAttribute("data-codex-model-rail", VERSION);
    host.style.cssText = "display:block; width:100%; min-width:260px; box-sizing:border-box;";

    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host {
          all: initial;
          display: block;
          box-sizing: border-box;
          width: 100%;
          color-scheme: light dark;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
        }

        * { box-sizing: border-box; }

        .shell {
          margin: 6px;
          padding: 8px;
          border: 1px solid color-mix(in srgb, CanvasText 12%, transparent);
          border-radius: 12px;
          background:
            linear-gradient(135deg, color-mix(in srgb, Canvas 96%, #7c5cff 4%), Canvas);
          box-shadow:
            0 8px 28px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 color-mix(in srgb, white 48%, transparent);
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 0 2px 7px;
          min-height: 18px;
        }

        .title {
          display: flex;
          align-items: center;
          min-width: 0;
          gap: 6px;
          color: color-mix(in srgb, CanvasText 72%, transparent);
          font-size: 11px;
          font-weight: 650;
          letter-spacing: 0.01em;
        }

        .spark {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: linear-gradient(135deg, #806dff, #37b8ff);
          box-shadow: 0 0 0 3px color-mix(in srgb, #806dff 13%, transparent);
          flex: 0 0 auto;
        }

        .current {
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: color-mix(in srgb, CanvasText 48%, transparent);
          font-size: 10px;
          font-weight: 500;
        }

        .track {
          display: flex;
          align-items: center;
          gap: 5px;
          width: 100%;
          overflow-x: auto;
          padding: 1px;
          scrollbar-width: none;
        }

        .track::-webkit-scrollbar { display: none; }

        button {
          appearance: none;
          border: 1px solid color-mix(in srgb, CanvasText 10%, transparent);
          border-radius: 9px;
          background: color-mix(in srgb, CanvasText 5%, transparent);
          color: CanvasText;
          min-height: 30px;
          padding: 6px 10px;
          white-space: nowrap;
          font: inherit;
          font-size: 11px;
          font-weight: 570;
          cursor: default;
          transition:
            background 120ms ease,
            border-color 120ms ease,
            transform 120ms ease;
        }

        button:hover {
          border-color: color-mix(in srgb, #806dff 42%, transparent);
          background: color-mix(in srgb, #806dff 13%, transparent);
        }

        button:active { transform: scale(0.98); }

        button:focus-visible {
          outline: 2px solid color-mix(in srgb, #806dff 76%, transparent);
          outline-offset: 1px;
        }

        button.selected {
          border-color: color-mix(in srgb, #806dff 52%, transparent);
          background: color-mix(in srgb, #806dff 18%, transparent);
        }

        button.action {
          border-style: dashed;
          color: color-mix(in srgb, CanvasText 70%, transparent);
        }

        .index {
          display: inline-grid;
          place-items: center;
          min-width: 15px;
          height: 15px;
          margin-right: 5px;
          border-radius: 5px;
          background: color-mix(in srgb, CanvasText 8%, transparent);
          color: color-mix(in srgb, CanvasText 52%, transparent);
          font-size: 9px;
          font-weight: 700;
        }

        .status {
          padding: 5px 3px 2px;
          color: color-mix(in srgb, CanvasText 46%, transparent);
          font-size: 10px;
          line-height: 1.35;
        }
      </style>
      <section class="shell" aria-label="Codex quick model rail">
        <div class="header">
          <div class="title"><span class="spark"></span><span>快捷模型</span></div>
          <div class="current"></div>
        </div>
        <div class="track" role="toolbar" aria-label="快捷模型选择"></div>
        <div class="status" aria-live="polite"></div>
      </section>
    `;

    state.host = host;
    state.shadow = shadow;
    state.surface = surface;

    surface.prepend(host);
    render();
  }

  function currentModelLabel() {
    const value = labelFor(state.trigger);
    return value || "当前模型";
  }

  function discoverCandidates() {
    if (!state.requestedModels) return [];

    const candidates = [];
    const seenLabels = new Set();
    for (const element of officialItems()) {
      if (state.baselineItems.has(element)) continue;
      const label = labelFor(element);
      if (!label || seenLabels.has(label)) continue;
      if (/^(model|模型|advanced|高级|power|能力)$/iu.test(label)) continue;
      seenLabels.add(label);
      candidates.push({ element, label });
    }
    return candidates.slice(0, 12);
  }

  function updateCandidates() {
    const candidates = discoverCandidates();
    if (candidates.length > 0) state.candidates = candidates;
    render();
  }

  function dispatchHover(element) {
    const options = { bubbles: true, composed: true, pointerType: "mouse" };
    try {
      element.dispatchEvent(new PointerEvent("pointerover", options));
      element.dispatchEvent(new PointerEvent("pointerenter", options));
      element.dispatchEvent(new PointerEvent("pointermove", options));
    } catch {
      element.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
      element.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    }
  }

  function requestModelList() {
    const row = [...document.querySelectorAll(MODEL_ROW_SELECTOR)].find(isVisible);
    if (!row) {
      render("当前版本未暴露 Model 子菜单锚点；已安全停止。", true);
      return;
    }

    const interactive = row.closest('[role="menuitem"], button') ?? row;
    state.baselineItems = new Set(officialItems());
    state.requestedModels = true;
    state.candidates = [];

    interactive.focus?.({ preventScroll: true });
    dispatchHover(interactive);
    interactive.click?.();

    for (const delay of [50, 120, 250, 500]) {
      const timer = setTimeout(() => {
        state.timers.delete(timer);
        updateCandidates();
      }, delay);
      state.timers.add(timer);
    }
    render("正在读取官方模型列表…");
  }

  function activateCandidate(candidate) {
    const element = candidate?.element;
    if (!element || !element.isConnected || !isVisible(element)) {
      state.candidates = [];
      render("官方模型子菜单已关闭，请重新加载。", true);
      return;
    }

    const options = { bubbles: true, composed: true, pointerType: "mouse" };
    try {
      element.dispatchEvent(new PointerEvent("pointerdown", options));
      element.dispatchEvent(new PointerEvent("pointerup", options));
    } catch {
      // HTMLElement.click remains the compatibility fallback.
    }
    element.click();
  }

  function render(statusOverride = null, isError = false) {
    const shadow = state.shadow;
    if (!shadow) return;

    const current = shadow.querySelector(".current");
    const track = shadow.querySelector(".track");
    const status = shadow.querySelector(".status");
    if (!current || !track || !status) return;

    current.textContent = currentModelLabel();
    track.replaceChildren();

    if (state.candidates.length === 0) {
      const loadButton = document.createElement("button");
      loadButton.className = "action";
      loadButton.type = "button";
      loadButton.textContent = state.requestedModels ? "重新加载模型列表 ↻" : "加载模型列表 ›";
      loadButton.addEventListener("click", requestModelList);
      track.appendChild(loadButton);
    } else {
      const currentLabel = currentModelLabel().toLocaleLowerCase();
      state.candidates.forEach((candidate, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.title = `${index + 1} · ${candidate.label}`;
        button.setAttribute("aria-label", `选择模型 ${candidate.label}`);
        if (currentLabel.includes(candidate.label.toLocaleLowerCase())) {
          button.classList.add("selected");
        }

        const shortcut = document.createElement("span");
        shortcut.className = "index";
        shortcut.textContent = String(index + 1);
        button.append(shortcut, document.createTextNode(candidate.label));
        button.addEventListener("pointerdown", (event) => event.preventDefault());
        button.addEventListener("click", () => activateCandidate(candidate));
        track.appendChild(button);
      });
    }

    if (statusOverride) {
      status.textContent = statusOverride;
      status.style.color = isError ? "#d85b5b" : "";
    } else if (state.candidates.length > 0) {
      status.textContent = "按 1–9 可直接选择；最终切换仍由 Codex 官方菜单执行。";
      status.style.color = "";
    } else {
      status.textContent = "先展开官方 Model 子菜单，滑轨会动态镜像当前账号可用模型。";
      status.style.color = "";
    }
  }

  function sync() {
    state.scheduled = false;
    const trigger = document.querySelector(TRIGGER_SELECTOR);
    state.trigger = trigger;

    if (!trigger || !isPickerOpen(trigger)) {
      if (state.host) resetPickerSession();
      return;
    }

    const surface = nearestPickerSurface(trigger);
    if (!surface) return;
    if (!state.host?.isConnected || state.surface !== surface) createHost(surface);
    if (state.requestedModels) updateCandidates();
  }

  function scheduleSync() {
    if (state.scheduled) return;
    state.scheduled = true;
    requestAnimationFrame(sync);
  }

  state.observer = new MutationObserver(scheduleSync);
  state.observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["aria-expanded", "aria-controls", "data-state", "hidden"],
  });

  state.keyboardHandler = (event) => {
    if (!state.host?.isConnected || event.defaultPrevented) return;
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (!/^[1-9]$/.test(event.key)) return;

    const candidate = state.candidates[Number(event.key) - 1];
    if (!candidate) return;
    event.preventDefault();
    event.stopPropagation();
    activateCandidate(candidate);
  };
  window.addEventListener("keydown", state.keyboardHandler, true);

  state.sync = scheduleSync;
  state.dispose = () => {
    clearTimers();
    state.observer?.disconnect();
    window.removeEventListener("keydown", state.keyboardHandler, true);
    removeHost();
    if (window[GLOBAL_KEY] === state) delete window[GLOBAL_KEY];
  };

  window[GLOBAL_KEY] = state;
  scheduleSync();

  return {
    installed: true,
    reused: false,
    triggerFound: Boolean(document.querySelector(TRIGGER_SELECTOR)),
    version: VERSION,
  };
})();
