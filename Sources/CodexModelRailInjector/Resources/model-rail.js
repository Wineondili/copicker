(() => {
  "use strict";

  const VERSION = "0.6.0";
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
  const EFFORTS = ["low", "medium", "high", "xhigh", "max", "ultra"];
  const ROWS = [
    {
      name: "Sol",
      dots: [1, 2, 3, 4, 5, 6],
      colors: ["#FBE1E5", "#F7C6CC"],
    },
    {
      name: "Terra",
      dots: [1, 2, 3, 4, 5, 6],
      colors: ["#FFF1CF", "#FFE6B8"],
    },
    {
      name: "Luna",
      dots: [1, 2, 3, 4, 5],
      colors: ["#EEF9F1", "#DDF3E4"],
    },
  ];

  const ROW_HEIGHT = 48;
  const ROW_GAP = 16;
  const STAGE_WIDTH = 360;
  const STAGE_HEIGHT = ROW_HEIGHT * 3 + ROW_GAP * 2;
  const LEFT_PADDING = 34;
  const RIGHT_PADDING = 40;
  const USABLE_WIDTH = STAGE_WIDTH - LEFT_PADDING - RIGHT_PADDING;
  const START_INSET = 6;
  const RIGHT_INSET_IN_THUMB = 12;
  const ROW_CENTERS = [
    ROW_HEIGHT / 2,
    ROW_HEIGHT + ROW_GAP + ROW_HEIGHT / 2,
    ROW_HEIGHT * 2 + ROW_GAP * 2 + ROW_HEIGHT / 2,
  ];
  const ROW_BOTTOMS = [
    STAGE_HEIGHT - ROW_HEIGHT,
    STAGE_HEIGHT - (ROW_HEIGHT * 2 + ROW_GAP),
    0,
  ];
  const COLUMN_CENTERS = Array.from(
    { length: 6 },
    (_, index) => LEFT_PADDING + (USABLE_WIDTH / 5) * index,
  );

  const previous = window[GLOBAL_KEY];
  if (previous?.version === VERSION) {
    previous.sync();
    return {
      installed: true,
      reused: true,
      triggerFound: Boolean(previous.hasPrimaryTarget?.()),
      primaryOnly: true,
      secondaryExcluded: true,
      prototype: false,
      visualPending: false,
      localOnly: true,
      design: "preview-2d",
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
    currentRow: null,
    currentIndex: null,
    fastMode: false,
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
    state.resizeObserver = null;
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

  function initializeSelectorFromTrigger(trigger) {
    const triggerText = String(trigger?.textContent || "")
      .replace(/\s+/g, " ")
      .trim();
    const rowIndex = ROWS.findIndex((row) =>
      new RegExp(`\\b${row.name}\\b`, "i").test(triggerText),
    );
    const effort = trigger?.getAttribute("data-selected-reasoning-effort") || "";
    const effortIndex = EFFORTS.indexOf(effort);
    const isValid =
      rowIndex >= 0 &&
      effortIndex >= 0 &&
      ROWS[rowIndex].dots.includes(effortIndex + 1);

    state.currentRow = isValid ? rowIndex : null;
    state.currentIndex = isValid ? effortIndex : null;
    state.fastMode = false;
  }

  function hasSelectorSelection() {
    return (
      Number.isInteger(state.currentRow) &&
      Number.isInteger(state.currentIndex) &&
      Boolean(ROWS[state.currentRow]?.dots[state.currentIndex])
    );
  }

  function xFor(rowIndex, indexInRow) {
    const dotNumber = ROWS[rowIndex].dots[indexInRow];
    return COLUMN_CENTERS[dotNumber - 1];
  }

  function rightBoundaryFor(rowIndex, indexInRow) {
    const dotNumber = ROWS[rowIndex].dots[indexInRow];
    return Math.min(
      STAGE_WIDTH,
      COLUMN_CENTERS[dotNumber - 1] + RIGHT_INSET_IN_THUMB,
    );
  }

  function updateSelectorUI(host) {
    const shadow = host.shadowRoot;
    if (!shadow) return;

    const selection = shadow.querySelector("#selection");
    const thumb = shadow.querySelector("#thumb");
    const modelElement = shadow.querySelector(".current-selection .model");
    const effortElement = shadow.querySelector(".current-selection .effort");
    const fastElement = shadow.querySelector(".current-selection .fast-status");
    const selected = hasSelectorSelection();

    if (!selected) {
      host.setAttribute("data-selector-model", "Other");
      host.setAttribute("data-selector-effort", "");
      host.setAttribute("data-selector-fast", "false");
      host.setAttribute("data-selector-has-selection", "false");
      selection?.classList.add("inactive");
      thumb?.classList.add("inactive");
      thumb?.classList.remove("fast");
      for (const dot of shadow.querySelectorAll(".dot")) {
        dot.classList.remove("inside");
      }
      for (const label of shadow.querySelectorAll(".effort-label")) {
        label.classList.remove("active");
      }
      if (modelElement) modelElement.textContent = "Other";
      if (effortElement) {
        effortElement.textContent = "";
        effortElement.classList.remove("ultra");
      }
      fastElement?.classList.remove("active");
      shadow.querySelector("#stage")?.setAttribute("aria-label", "2D selector, no selection");
      return;
    }

    const rowIndex = state.currentRow;
    const indexInRow = state.currentIndex;
    const row = ROWS[rowIndex];
    const dotNumber = row.dots[indexInRow];
    const effort = EFFORTS[dotNumber - 1];
    const x = xFor(rowIndex, indexInRow);
    const y = ROW_CENTERS[rowIndex];
    const width = rightBoundaryFor(rowIndex, indexInRow);
    const [light, base] = row.colors;

    host.setAttribute("data-selector-model", row.name);
    host.setAttribute("data-selector-effort", effort);
    host.setAttribute("data-selector-fast", String(state.fastMode));
    host.setAttribute("data-selector-has-selection", "true");

    if (thumb) {
      thumb.classList.remove("inactive");
      thumb.classList.toggle("fast", state.fastMode);
      thumb.style.left = `${x}px`;
      thumb.style.top = `${y}px`;
    }
    if (selection) {
      selection.classList.remove("inactive");
      selection.style.width = `${Math.max(0, width - START_INSET)}px`;
      selection.style.height = `${ROW_HEIGHT}px`;
      selection.style.bottom = `${ROW_BOTTOMS[rowIndex]}px`;
      selection.style.borderRadius = `${ROW_HEIGHT / 2}px`;
      selection.style.setProperty("--fill-light", light);
      selection.style.setProperty("--fill-base", base);
    }

    for (const dot of shadow.querySelectorAll(".dot")) {
      const dotRow = Number(dot.getAttribute("data-row"));
      const dotNumberForElement = Number(dot.getAttribute("data-dot"));
      const inside =
        dotRow === rowIndex &&
        COLUMN_CENTERS[dotNumberForElement - 1] <= width;
      dot.classList.toggle("inside", inside);
    }
    for (const [index, label] of [...shadow.querySelectorAll(".effort-label")].entries()) {
      label.classList.toggle("active", index === dotNumber - 1);
    }

    if (modelElement) modelElement.textContent = row.name;
    if (effortElement) {
      effortElement.textContent = effort;
      effortElement.classList.toggle("ultra", effort === "ultra");
    }
    fastElement?.classList.toggle("active", state.fastMode);
    shadow.querySelector("#stage")?.setAttribute(
      "aria-label",
      `${row.name}, ${effort}${state.fastMode ? ", Fast" : ""}`,
    );
  }

  function nearestRowFromY(y) {
    let best = 0;
    let bestDistance = Infinity;
    for (const [index, center] of ROW_CENTERS.entries()) {
      const distance = Math.abs(y - center);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    }
    return best;
  }

  function nearestIndexInRow(rowIndex, x) {
    let best = 0;
    let bestDistance = Infinity;
    for (const [index, dotNumber] of ROWS[rowIndex].dots.entries()) {
      const distance = Math.abs(x - COLUMN_CENTERS[dotNumber - 1]);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    }
    return best;
  }

  function updateFromPointer(host, clientX, clientY) {
    const stage = host.shadowRoot?.querySelector("#stage");
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    const y = clamp(clientY - rect.top, 0, rect.height);
    const scaledX = (x / rect.width) * STAGE_WIDTH;
    const scaledY = (y / rect.height) * STAGE_HEIGHT;
    state.currentRow = nearestRowFromY(scaledY);
    state.currentIndex = nearestIndexInRow(state.currentRow, scaledX);
    updateSelectorUI(host);
  }

  function render2DSelector(host) {
    if (host.shadowRoot) return;
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        @property --fill-light {
          syntax: "<color>";
          inherits: false;
          initial-value: #EEF9F1;
        }

        @property --fill-base {
          syntax: "<color>";
          inherits: false;
          initial-value: #DDF3E4;
        }

        :host {
          all: initial;
          display: block;
          width: 560px;
          color-scheme: dark;
          --popover: rgb(44, 44, 44);
          --border: #444448;
          --text: #f3f3f4;
          --dot: #7e7e83;
          --dot-active: rgba(255, 255, 255, 0.36);
          --thumb: #f5f5f6;
          --sol: #F7C6CC;
          --sol-light: #FBE1E5;
          --terra: #FFE6B8;
          --terra-light: #FFF1CF;
          --luna: #DDF3E4;
          --luna-light: #EEF9F1;
          --row-h: 48px;
          --row-gap: 16px;
          --thumb-size: 56px;
          --stage-w: 360px;
          --start-inset: 6px;
          color: var(--text);
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display",
            "SF Pro Text", "PingFang SC", "Helvetica Neue", Arial, sans-serif;
        }

        * { box-sizing: border-box; }

        .popover {
          width: 560px;
          padding: 24px 26px 22px;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0)),
            var(--popover);
          border: 1px solid var(--border);
          border-radius: 24px;
          box-shadow:
            0 24px 70px rgba(0, 0, 0, 0.42),
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
          user-select: none;
        }

        .main {
          display: grid;
          grid-template-columns: 90px var(--stage-w);
          column-gap: 12px;
          align-items: start;
        }

        .labels {
          height: calc(var(--row-h) * 3 + var(--row-gap) * 2);
          margin-top: 34px;
          display: grid;
          grid-template-rows: repeat(3, var(--row-h));
          row-gap: var(--row-gap);
        }

        .label {
          display: flex;
          align-items: center;
          font-size: 22px;
          font-weight: 650;
          letter-spacing: -0.03em;
        }

        .stage-shell {
          position: relative;
          width: var(--stage-w);
          padding-top: 34px;
        }

        .effort-labels {
          position: absolute;
          left: 0;
          top: -8px;
          width: var(--stage-w);
          height: 30px;
          pointer-events: none;
        }

        .effort-label {
          position: absolute;
          top: 0;
          transform: translateX(-50%);
          white-space: nowrap;
          font-size: 22px;
          font-weight: 650;
          letter-spacing: -0.03em;
          color: #fff;
          opacity: 0;
          transition: opacity 180ms ease;
        }

        .effort-label.ultra { color: #A67DF2; }
        .effort-label.active { opacity: 1; }

        .stage {
          position: relative;
          width: var(--stage-w);
          height: calc(var(--row-h) * 3 + var(--row-gap) * 2);
          cursor: pointer;
          touch-action: none;
          outline: none;
        }

        .stage:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.32);
          outline-offset: 6px;
          border-radius: 14px;
        }

        .selection {
          position: absolute;
          left: var(--start-inset);
          bottom: 0;
          width: 0;
          height: var(--row-h);
          border-radius: 999px;
          --fill-light: var(--luna-light);
          --fill-base: var(--luna);
          background: linear-gradient(135deg, var(--fill-light) 0%, var(--fill-base) 100%);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.18),
            0 10px 24px rgba(0, 0, 0, 0.06);
          opacity: 1;
          pointer-events: none;
          transition:
            width 240ms cubic-bezier(0.22, 0.86, 0.2, 1),
            bottom 240ms cubic-bezier(0.22, 0.86, 0.2, 1),
            border-radius 240ms cubic-bezier(0.22, 0.86, 0.2, 1),
            opacity 160ms ease,
            --fill-light 240ms ease,
            --fill-base 240ms ease;
        }

        .selection.inactive { opacity: 0; }

        .dot {
          position: absolute;
          width: 7px;
          height: 7px;
          border-radius: 999px;
          transform: translate(-50%, -50%);
          background: var(--dot);
          pointer-events: none;
          transition: background 180ms ease, opacity 180ms ease;
        }

        .dot.inside { background: var(--dot-active); }

        .thumb {
          position: absolute;
          width: var(--thumb-size);
          height: var(--thumb-size);
          border-radius: 999px;
          background: var(--thumb);
          transform: translate(-50%, -50%);
          opacity: 1;
          pointer-events: auto;
          cursor: grab;
          box-shadow:
            0 10px 22px rgba(0, 0, 0, 0.24),
            0 2px 6px rgba(0, 0, 0, 0.10),
            inset 0 0 0 1px rgba(0, 0, 0, 0.03);
          transition:
            left 240ms cubic-bezier(0.22, 0.86, 0.2, 1),
            top 240ms cubic-bezier(0.22, 0.86, 0.2, 1),
            transform 150ms ease,
            box-shadow 150ms ease,
            opacity 160ms ease;
        }

        .thumb.inactive {
          opacity: 0;
          pointer-events: none;
        }

        .thumb::before,
        .thumb::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          width: 65%;
          height: 65%;
          pointer-events: none;
          opacity: 0;
          -webkit-mask:
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12.261 1.03462C12.6971 1.15253 13 1.54819 13 1.99997V8.99997H19C19.3581 8.99997 19.6888 9.19141 19.8671 9.50191C20.0455 9.8124 20.0442 10.1945 19.8638 10.5038L12.8638 22.5038C12.6361 22.8941 12.1751 23.0832 11.739 22.9653C11.3029 22.8474 11 22.4517 11 22V15H5C4.64193 15 4.3112 14.8085 4.13286 14.498C3.95452 14.1875 3.9558 13.8054 4.13622 13.4961L11.1362 1.4961C11.3639 1.10586 11.8249 0.916719 12.261 1.03462ZM6.74104 13H12C12.5523 13 13 13.4477 13 14V18.301L17.259 11H12C11.4477 11 11 10.5523 11 9.99997V5.69889L6.74104 13Z'/%3E%3C/svg%3E") center/contain no-repeat;
          mask:
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12.261 1.03462C12.6971 1.15253 13 1.54819 13 1.99997V8.99997H19C19.3581 8.99997 19.6888 9.19141 19.8671 9.50191C20.0455 9.8124 20.0442 10.1945 19.8638 10.5038L12.8638 22.5038C12.6361 22.8941 12.1751 23.0832 11.739 22.9653C11.3029 22.8474 11 22.4517 11 22V15H5C4.64193 15 4.3112 14.8085 4.13286 14.498C3.95452 14.1875 3.9558 13.8054 4.13622 13.4961L11.1362 1.4961C11.3639 1.10586 11.8249 0.916719 12.261 1.03462ZM6.74104 13H12C12.5523 13 13 13.4477 13 14V18.301L17.259 11H12C11.4477 11 11 10.5523 11 9.99997V5.69889L6.74104 13Z'/%3E%3C/svg%3E") center/contain no-repeat;
          transition: opacity 160ms ease, transform 160ms ease;
        }

        .thumb::before {
          background: rgba(255, 255, 255, 0.72);
          transform: translate(calc(-50% + 1px), calc(-50% + 1px));
        }

        .thumb::after {
          background: rgba(72, 72, 78, 0.24);
          transform: translate(calc(-50% - 0.7px), calc(-50% - 0.7px));
        }

        .thumb.fast::before,
        .thumb.fast::after { opacity: 1; }

        .stage.dragging .thumb {
          transform: translate(-50%, -50%) scale(1.02);
        }

        .current-selection {
          margin-top: 18px;
          padding-left: 102px;
          min-height: 26px;
          font-size: 19px;
          font-weight: 600;
          letter-spacing: -0.015em;
        }

        .current-selection .model { color: var(--text); }

        .current-selection .effort {
          margin-left: 7px;
          color: #8e8e93;
          transition: color 180ms ease;
        }

        .current-selection .effort:empty { margin-left: 0; }
        .current-selection .effort.ultra { color: #A67DF2; }

        .current-selection .fast-status {
          margin-left: 7px;
          color: #0099ff;
          opacity: 0;
          transform: translateY(2px);
          display: inline-block;
          transition: opacity 160ms ease, transform 160ms ease;
        }

        .current-selection .fast-status.active {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .selection,
          .dot,
          .thumb,
          .effort-label,
          .current-selection .effort,
          .current-selection .fast-status { transition: none; }
        }
      </style>
      <section class="popover" data-design="preview-2d" aria-label="Codex Model Rail">
        <div class="main">
          <div class="labels">
            <div class="label">Sol</div>
            <div class="label">Terra</div>
            <div class="label">Luna</div>
          </div>
          <div class="stage-shell">
            <div class="effort-labels" id="effortLabels"></div>
            <div class="stage" id="stage" tabindex="0" aria-label="2D selector">
              <div class="selection" id="selection"></div>
              <div id="dots"></div>
              <div class="thumb" id="thumb"></div>
            </div>
          </div>
        </div>
        <div class="current-selection" id="currentSelection">
          <span class="model"></span><span class="effort"></span><span class="fast-status">Fast</span>
        </div>
      </section>
    `;

    const stage = shadow.querySelector("#stage");
    const dots = shadow.querySelector("#dots");
    const effortLabels = shadow.querySelector("#effortLabels");
    const thumb = shadow.querySelector("#thumb");

    for (const [index, effort] of EFFORTS.entries()) {
      const label = document.createElement("div");
      label.className = `effort-label${effort === "ultra" ? " ultra" : ""}`;
      label.textContent = effort;
      label.style.left = `${COLUMN_CENTERS[index]}px`;
      effortLabels?.append(label);
    }

    for (const [rowIndex, row] of ROWS.entries()) {
      for (const dotNumber of row.dots) {
        const dot = document.createElement("div");
        dot.className = "dot";
        dot.setAttribute("data-row", String(rowIndex));
        dot.setAttribute("data-dot", String(dotNumber));
        dot.style.left = `${COLUMN_CENTERS[dotNumber - 1]}px`;
        dot.style.top = `${ROW_CENTERS[rowIndex]}px`;
        dots?.append(dot);
      }
    }

    let pointerDownOnThumb = false;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerMoved = false;
    const clickMoveThreshold = 5;

    stage?.addEventListener("pointerdown", (event) => {
      pointerDownOnThumb = event.target === thumb && hasSelectorSelection();
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
      pointerMoved = false;
      stage.setPointerCapture(event.pointerId);
      stage.classList.add("dragging");
      if (!pointerDownOnThumb) updateFromPointer(host, event.clientX, event.clientY);
    });

    stage?.addEventListener("pointermove", (event) => {
      if (!stage.hasPointerCapture(event.pointerId)) return;
      if (Math.hypot(event.clientX - pointerStartX, event.clientY - pointerStartY) > clickMoveThreshold) {
        pointerMoved = true;
      }
      if (!pointerDownOnThumb || pointerMoved) {
        updateFromPointer(host, event.clientX, event.clientY);
      }
    });

    stage?.addEventListener("pointerup", (event) => {
      if (stage.hasPointerCapture(event.pointerId)) {
        if (pointerDownOnThumb && !pointerMoved) {
          state.fastMode = !state.fastMode;
          updateSelectorUI(host);
        } else {
          updateFromPointer(host, event.clientX, event.clientY);
        }
        stage.releasePointerCapture(event.pointerId);
      }
      stage.classList.remove("dragging");
      pointerDownOnThumb = false;
      pointerMoved = false;
    });

    stage?.addEventListener("pointercancel", () => {
      stage.classList.remove("dragging");
      pointerDownOnThumb = false;
      pointerMoved = false;
    });

    stage?.addEventListener("keydown", (event) => {
      if (!event.key.startsWith("Arrow")) return;
      event.preventDefault();
      event.stopPropagation();

      if (!hasSelectorSelection()) {
        state.currentRow = 0;
        state.currentIndex = 0;
        state.fastMode = false;
        updateSelectorUI(host);
        return;
      }

      if (event.key === "ArrowUp") {
        state.currentRow = Math.max(0, state.currentRow - 1);
        state.currentIndex = Math.min(
          state.currentIndex,
          ROWS[state.currentRow].dots.length - 1,
        );
      } else if (event.key === "ArrowDown") {
        state.currentRow = Math.min(2, state.currentRow + 1);
        state.currentIndex = Math.min(
          state.currentIndex,
          ROWS[state.currentRow].dots.length - 1,
        );
      } else if (event.key === "ArrowLeft") {
        state.currentIndex = Math.max(0, state.currentIndex - 1);
      } else if (event.key === "ArrowRight") {
        state.currentIndex = Math.min(
          ROWS[state.currentRow].dots.length - 1,
          state.currentIndex + 1,
        );
      }
      updateSelectorUI(host);
    });

    shadow.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
    shadow.addEventListener("click", (event) => event.stopPropagation());
    updateSelectorUI(host);
  }

  function ensureDetachedPopover() {
    let host = document.getElementById(POPOVER_HOST_ID);
    if (!host) {
      host = document.createElement("div");
      host.id = POPOVER_HOST_ID;
    }

    host.setAttribute("data-codex-model-rail-popover", VERSION);
    host.setAttribute("data-prototype", "false");
    host.setAttribute("data-visual-pending", "false");
    host.setAttribute("data-local-only", "true");
    host.setAttribute("data-design-source", "preview.html");
    host.setAttribute("aria-hidden", "true");
    host.style.position = "fixed";
    host.style.left = "0px";
    host.style.top = "0px";
    host.style.margin = "0";
    host.style.pointerEvents = "none";
    host.style.visibility = "hidden";
    host.style.zIndex = "2147483000";

    if (host.parentElement !== document.body) document.body.append(host);
    render2DSelector(host);
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

    const shouldInitialize = state.observedSurface !== target.surface;
    if (shouldInitialize) initializeSelectorFromTrigger(target.trigger);
    const host = ensureDetachedPopover();
    if (shouldInitialize) updateSelectorUI(host);

    if (state.observedSurface !== target.surface) {
      state.resizeObserver?.disconnect();
      state.resizeObserver = new ResizeObserver(scheduleSync);
      state.resizeObserver.observe(target.surface);
      state.resizeObserver.observe(host);
      state.observedSurface = target.surface;
    }
    positionDetachedPopover();
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
    prototype: false,
    visualPending: false,
    localOnly: true,
    design: "preview-2d",
    version: VERSION,
  };
})();
