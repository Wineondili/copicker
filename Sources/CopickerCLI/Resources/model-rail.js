(() => {
  "use strict";

  const VERSION = "0.10.0";
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
  const MODEL_ROW_SELECTOR = "[data-model-picker-model-row]";
  const CONVERSATION_CONTEXT_SELECTOR = "[data-above-composer-conversation-id]";
  const FAST_MODE_SELECTOR = '[role="menuitemcheckbox"][data-fast-mode-enabled]';
  const APP_SERVER_HOST_ID = "local";
  const APP_SERVER_REQUEST_TIMEOUT_MS = 5000;
  const SETTINGS_CONFIRMATION_TIMEOUT_MS = 1800;
  const KEYBOARD_COMMIT_DELAY_MS = 120;
  const POPOVER_ANIMATION_MS = 180;
  const PLACEMENT_RETURN_DELAY_MS = 420;
  const EFFORTS = ["low", "medium", "high", "xhigh", "max", "ultra"];
  const DEFAULT_CONFIG = {
    enabled: true,
    visibleModels: ["sol", "terra", "luna"],
    preferredPlacement: "top",
    appearance: "dark",
  };
  const ALL_ROWS = [
    {
      id: "sol",
      name: "Sol",
      catalogDisplayName: "GPT-5.6-Sol",
      catalogDisplayNames: ["GPT-5.6-Sol", "GPT-5.6 Sol"],
      dots: [1, 2, 3, 4, 5, 6],
      colors: ["#FBE1E5", "#F7C6CC"],
      textColors: ["#f1c0c9", "#edb7c1"],
      supportsFast: true,
    },
    {
      id: "terra",
      name: "Terra",
      catalogDisplayName: "GPT-5.6-Terra",
      catalogDisplayNames: ["GPT-5.6-Terra", "GPT-5.6 Terra"],
      dots: [1, 2, 3, 4, 5, 6],
      colors: ["#FFF1CF", "#FFE6B8"],
      textColors: ["#f0d69b", "#ebcd90"],
      supportsFast: true,
    },
    {
      id: "luna",
      name: "Luna",
      catalogDisplayName: "GPT-5.6-Luna",
      catalogDisplayNames: ["GPT-5.6-Luna", "GPT-5.6 Luna"],
      dots: [1, 2, 3, 4, 5],
      colors: ["#EEF9F1", "#DDF3E4"],
      textColors: ["#c1e2cb", "#b7dcc3"],
      supportsFast: true,
    },
    {
      id: "daybreak-blue",
      name: "Daybreak",
      catalogDisplayName: "Daybreak Blue",
      catalogDisplayNames: ["Daybreak Blue", "GPT Daybreak Blue"],
      dots: [1, 2, 3, 4, 5, 6],
      colors: ["#DDEEFF", "#C2E0FF"],
      textColors: ["#afd2f2", "#9bc5eb"],
      supportsFast: false,
    },
    {
      id: "gpt-5.5",
      name: "GPT-5.5",
      catalogDisplayName: "GPT-5.5",
      catalogDisplayNames: ["GPT-5.5"],
      dots: [1, 2, 3, 4],
      colors: ["#E3EDFF", "#CADCFF"],
      textColors: ["#bad0f4", "#a9c3ee"],
      supportsFast: true,
    },
    {
      id: "gpt-5.3-codex-spark",
      name: "Codex Spark",
      catalogDisplayName: "GPT-5.3 Codex Spark",
      catalogDisplayNames: ["GPT-5.3 Codex Spark", "GPT-5.3-Codex-Spark"],
      dots: [1, 2, 3, 4],
      colors: ["#F0E7FF", "#E0D1FA"],
      textColors: ["#d4c0f2", "#c8afea"],
      supportsFast: false,
    },
  ];

  function normalizeConfig(rawConfig) {
    const visibleModelIDs = new Set(
      Array.isArray(rawConfig?.visibleModels)
        ? rawConfig.visibleModels.filter((value) => typeof value === "string")
        : DEFAULT_CONFIG.visibleModels,
    );
    const normalizedModels = ALL_ROWS
      .map((row) => row.id)
      .filter((id) => visibleModelIDs.has(id));
    return {
      enabled: typeof rawConfig?.enabled === "boolean"
        ? rawConfig.enabled
        : DEFAULT_CONFIG.enabled,
      visibleModels: normalizedModels.length > 0
        ? normalizedModels
        : [...DEFAULT_CONFIG.visibleModels],
      preferredPlacement: ["top", "left", "right"].includes(
        rawConfig?.preferredPlacement,
      )
        ? rawConfig.preferredPlacement
        : DEFAULT_CONFIG.preferredPlacement,
      appearance: ["codex", "system", "light", "dark"].includes(
        rawConfig?.appearance,
      )
        ? rawConfig.appearance
        : DEFAULT_CONFIG.appearance,
    };
  }

  const CONFIG = normalizeConfig(window.__COPICKER_CONFIG__);
  delete window.__COPICKER_CONFIG__;
  const CONFIG_SIGNATURE = JSON.stringify(CONFIG);
  const ROWS = ALL_ROWS.filter((row) => CONFIG.visibleModels.includes(row.id));

  const ROW_HEIGHT = 48;
  const ROW_GAP = 16;
  const STAGE_WIDTH = 388;
  const STAGE_HEIGHT = ROW_HEIGHT * ROWS.length + ROW_GAP * (ROWS.length - 1);
  const LEFT_PADDING = 34;
  const RIGHT_PADDING = 34;
  const USABLE_WIDTH = STAGE_WIDTH - LEFT_PADDING - RIGHT_PADDING;
  const START_INSET = 6;
  const RIGHT_INSET_IN_THUMB = 12;
  const MODEL_COLUMN_WIDTH = ROWS.some((row) => row.name.length > 7) ? 190 : 90;
  const POPOVER_INNER_WIDTH = 579.5 + (MODEL_COLUMN_WIDTH - 90);
  const HOST_WIDTH = POPOVER_INNER_WIDTH * 0.5;
  const HOST_HEIGHT = 134.75 + Math.max(0, ROWS.length - 3) * 32;
  const ROW_CENTERS = Array.from(
    { length: ROWS.length },
    (_, index) => index * (ROW_HEIGHT + ROW_GAP) + ROW_HEIGHT / 2,
  );
  const ROW_BOTTOMS = Array.from(
    { length: ROWS.length },
    (_, index) => STAGE_HEIGHT - (index + 1) * ROW_HEIGHT - index * ROW_GAP,
  );
  const COLUMN_CENTERS = Array.from(
    { length: 6 },
    (_, index) => LEFT_PADDING + (USABLE_WIDTH / 5) * index,
  );

  const previous = window[GLOBAL_KEY];
  if (!CONFIG.enabled) {
    previous?.dispose?.();
    document.getElementById(LEGACY_HOST_ID)?.remove();
    document.getElementById(POPOVER_HOST_ID)?.remove();
    return {
      installed: true,
      disabled: true,
      triggerFound: false,
      primaryOnly: true,
      secondaryExcluded: false,
      secondaryAvoided: true,
      prototype: false,
      visualPending: false,
      localOnly: false,
      switchMode: "thread-settings-update",
      design: "preview-2d",
      version: VERSION,
    };
  }
  if (
    previous?.version === VERSION &&
    previous?.configSignature === CONFIG_SIGNATURE
  ) {
    previous.sync();
    return {
      installed: true,
      reused: true,
      triggerFound: Boolean(previous.hasPrimaryTarget?.()),
      primaryOnly: true,
      secondaryExcluded: false,
      secondaryAvoided: true,
      prototype: false,
      visualPending: false,
      localOnly: false,
      switchMode: "thread-settings-update",
      design: "preview-2d",
      version: VERSION,
    };
  }
  previous?.dispose?.();

  const state = {
    version: VERSION,
    config: CONFIG,
    configSignature: CONFIG_SIGNATURE,
    observer: null,
    scheduled: false,
    trigger: null,
    primarySurface: null,
    popoverHost: null,
    resizeObserver: null,
    observedSurface: null,
    closeTimer: null,
    revealFrame: null,
    placementReturnTimer: null,
    latchedPlacement: null,
    pointerInsidePopover: false,
    pointerVisitedPopover: false,
    dismissedForCurrentOpen: false,
    currentRow: null,
    currentIndex: null,
    recognizedRow: null,
    recognizedEffort: null,
    fastMode: false,
    selectionRevision: 0,
    confirmedSelection: null,
    commitTimer: null,
    commitQueue: Promise.resolve(),
    commitInFlight: false,
    pendingRequests: new Map(),
    settingsWaiters: new Set(),
    modelCatalog: null,
    modelCatalogPromise: null,
    currentThreadID: null,
    switchState: "idle",
    lastSwitchError: null,
    handleBridgeMessage: null,
    appearanceObserver: null,
    appearanceMedia: null,
    disposed: false,
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

  function removeDetachedPopover({ animated = true } = {}) {
    resetPlacementSession();
    state.resizeObserver?.disconnect();
    state.resizeObserver = null;
    state.observedSurface = null;
    window.cancelAnimationFrame(state.revealFrame);
    state.revealFrame = null;

    const host = state.popoverHost || document.getElementById(POPOVER_HOST_ID);
    if (!host) return;

    if (!animated) {
      window.clearTimeout(state.closeTimer);
      state.closeTimer = null;
      host.remove();
      if (state.popoverHost === host) state.popoverHost = null;
      return;
    }

    if (host.getAttribute("data-open-state") === "closing") return;
    host.setAttribute("data-open-state", "closing");
    host.setAttribute("aria-hidden", "true");
    host.style.pointerEvents = "none";
    host.style.opacity = "0";
    host.style.transform = "translateY(6px) scale(0.98)";
    window.clearTimeout(state.closeTimer);
    state.closeTimer = window.setTimeout(() => {
      host.remove();
      if (state.popoverHost === host) state.popoverHost = null;
      state.closeTimer = null;
    }, POPOVER_ANIMATION_MS);
  }

  function isSecondarySurface(surface) {
    return (
      surface.matches(SECONDARY_SURFACE_SELECTOR) ||
      Boolean(surface.closest(SECONDARY_SURFACE_SELECTOR)) ||
      Boolean(surface.querySelector(SECONDARY_ITEM_SELECTOR)) ||
      Boolean(surface.querySelector(MODEL_ROW_SELECTOR))
    );
  }

  function findSecondaryMenuObstacleSurfaces(primarySurface = state.primarySurface) {
    const surfaces = new Set(document.querySelectorAll(PRIMARY_SURFACE_SELECTOR));
    for (const row of document.querySelectorAll(MODEL_ROW_SELECTOR)) {
      const surface =
        row.closest(PRIMARY_SURFACE_SELECTOR) ||
        row.closest(SECONDARY_SURFACE_SELECTOR);
      if (surface) surfaces.add(surface);
    }

    return [...surfaces].filter((surface) => {
      if (!isVisible(surface) || surface === primarySurface) return false;
      if (
        primarySurface?.contains(surface) ||
        (primarySurface && surface.contains(primarySurface))
      ) {
        return false;
      }
      const composerInputOverlay =
        (surface.matches(SECONDARY_SURFACE_SELECTOR) && surface) ||
        surface.closest(SECONDARY_SURFACE_SELECTOR);
      return (
        !composerInputOverlay ||
        Boolean(surface.querySelector(MODEL_ROW_SELECTOR))
      );
    });
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

  function placementRect(placement, popoverWidth, popoverHeight) {
    return {
      left: placement.x,
      top: placement.y,
      right: placement.x + popoverWidth,
      bottom: placement.y + popoverHeight,
    };
  }

  function placementIsValid(
    placement,
    anchorRect,
    popoverWidth,
    popoverHeight,
    obstacleRects = [],
  ) {
    if (!placement) return false;
    const rect = placementRect(placement, popoverWidth, popoverHeight);
    return (
      rect.left >= VIEWPORT_PADDING &&
      rect.top >= VIEWPORT_PADDING &&
      rect.right <= window.innerWidth - VIEWPORT_PADDING &&
      rect.bottom <= window.innerHeight - VIEWPORT_PADDING &&
      !overlaps(rect, anchorRect) &&
      obstacleRects.every((obstacleRect) => !overlaps(rect, obstacleRect))
    );
  }

  function uniquePlacementCandidates(candidates) {
    const seen = new Set();
    return candidates.filter((candidate) => {
      const key = `${Math.round(candidate.x * 100) / 100}:${Math.round(candidate.y * 100) / 100}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function computePlacement(
    anchorRect,
    popoverWidth,
    popoverHeight,
    obstacleRects = [],
    preferredPlacement = CONFIG.preferredPlacement,
  ) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    if (
      popoverWidth > viewportWidth - VIEWPORT_PADDING * 2 ||
      popoverHeight > viewportHeight - VIEWPORT_PADDING * 2
    ) {
      return null;
    }

    const maximumX = viewportWidth - VIEWPORT_PADDING - popoverWidth;
    const maximumY = viewportHeight - VIEWPORT_PADDING - popoverHeight;
    const centeredY = clamp(
      anchorRect.top + (anchorRect.height - popoverHeight) / 2,
      VIEWPORT_PADDING,
      maximumY,
    );
    const centeredX = clamp(
      anchorRect.left + (anchorRect.width - popoverWidth) / 2,
      VIEWPORT_PADDING,
      maximumX,
    );
    const topY = anchorRect.top - POPOVER_GAP - popoverHeight;
    const proposedTopCandidates = uniquePlacementCandidates([
      { placementVariant: "center", x: centeredX },
      {
        placementVariant: "align-right",
        x: clamp(
          anchorRect.right - popoverWidth,
          VIEWPORT_PADDING,
          maximumX,
        ),
      },
      {
        placementVariant: "align-left",
        x: clamp(
          anchorRect.left,
          VIEWPORT_PADDING,
          maximumX,
        ),
      },
      { placementVariant: "viewport-left", x: VIEWPORT_PADDING },
      {
        placementVariant: "viewport-right",
        x: maximumX,
      },
    ]).map((candidate) => ({
      placement: "top",
      ...candidate,
      x: Math.round(candidate.x * 100) / 100,
      y: topY,
    }));
    const directLeftX = anchorRect.left - POPOVER_GAP - popoverWidth;
    const clampedLeftX = clamp(directLeftX, VIEWPORT_PADDING, maximumX);
    const directRightX = anchorRect.right + POPOVER_GAP;
    const clampedRightX = clamp(directRightX, VIEWPORT_PADDING, maximumX);
    const raisedY = Math.min(
      anchorRect.top,
      ...obstacleRects.map((obstacleRect) => obstacleRect.top),
    ) - POPOVER_GAP - popoverHeight;
    const leftCandidates = uniquePlacementCandidates([
      {
        placement: "left",
        placementVariant: "center",
        x: directLeftX,
        y: centeredY,
      },
      {
        placement: "left",
        placementVariant: "viewport-clamped",
        x: clampedLeftX,
        y: centeredY,
      },
      {
        placement: "left",
        placementVariant: "raised",
        x: clampedLeftX,
        y: raisedY,
      },
    ]);
    const obstacleShiftCandidates = obstacleRects.map((obstacleRect) => ({
      placement: "right",
      placementVariant: "obstacle-left",
      x: obstacleRect.left - POPOVER_GAP - popoverWidth,
      y: centeredY,
    }));
    const rightCandidates = uniquePlacementCandidates([
      {
        placement: "right",
        placementVariant: "center",
        x: directRightX,
        y: centeredY,
      },
      {
        placement: "right",
        placementVariant: "viewport-clamped",
        x: clampedRightX,
        y: centeredY,
      },
      ...obstacleShiftCandidates,
      {
        placement: "right",
        placementVariant: "raised",
        x: clampedRightX,
        y: raisedY,
      },
    ]);
    const bottomCandidates = [{
      placement: "bottom",
      placementVariant: "center",
      x: centeredX,
      y: anchorRect.bottom + POPOVER_GAP,
    }];
    const orderedCandidates = preferredPlacement === "left"
      ? [...leftCandidates, ...proposedTopCandidates, ...rightCandidates, ...bottomCandidates]
      : preferredPlacement === "right"
        ? [...rightCandidates, ...proposedTopCandidates, ...leftCandidates, ...bottomCandidates]
        : [...proposedTopCandidates, ...rightCandidates, ...leftCandidates, ...bottomCandidates];

    const candidates = uniquePlacementCandidates(orderedCandidates);
    for (const candidate of candidates) {
      if (
        placementIsValid(
          candidate,
          anchorRect,
          popoverWidth,
          popoverHeight,
          obstacleRects,
        )
      ) {
        return { ...candidate, width: popoverWidth, height: popoverHeight };
      }
    }

    return null;
  }

  function normalizedDisplayName(value) {
    return String(value || "")
      .toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, "");
  }

  function rowMatchesDisplayName(row, value) {
    const normalizedValue = normalizedDisplayName(value);
    return row.catalogDisplayNames.some(
      (displayName) => normalizedDisplayName(displayName) === normalizedValue,
    );
  }

  function rowMatchesTriggerText(row, text) {
    const normalizedText = normalizedDisplayName(text);
    return [row.name, ...row.catalogDisplayNames].some((name) =>
      normalizedText.includes(normalizedDisplayName(name)),
    );
  }

  function initializeSelectorFromTrigger(trigger) {
    const triggerText = String(trigger?.textContent || "")
      .replace(/\s+/g, " ")
      .trim();
    const recognizedRow = ALL_ROWS.find((row) => rowMatchesTriggerText(row, triggerText)) || null;
    const rowIndex = recognizedRow
      ? ROWS.findIndex((row) => row.id === recognizedRow.id)
      : -1;
    const effort = trigger?.getAttribute("data-selected-reasoning-effort") || "";
    const effortIndex = EFFORTS.indexOf(effort);
    const isRecognized =
      Boolean(recognizedRow) &&
      effortIndex >= 0 &&
      recognizedRow.dots.includes(effortIndex + 1);
    const isVisibleSelection = isRecognized && rowIndex >= 0;

    state.currentRow = isVisibleSelection ? rowIndex : null;
    state.currentIndex = isVisibleSelection ? effortIndex : null;
    state.recognizedRow = isRecognized ? recognizedRow : null;
    state.recognizedEffort = isRecognized ? effort : null;
    state.fastMode = Boolean(
      isRecognized &&
      recognizedRow.supportsFast &&
      readOfficialFastMode(state.primarySurface),
    );
    state.selectionRevision += 1;
    state.confirmedSelection = snapshotSelection();
    state.currentThreadID = resolveCurrentThreadID(trigger);
    state.lastSwitchError = null;
    setSwitchState(state.currentThreadID ? "loading" : "no-thread");
    if (state.currentThreadID) {
      void ensureModelCatalog().catch(() => {});
    }
  }

  function hasSelectorSelection() {
    return (
      Number.isInteger(state.currentRow) &&
      Number.isInteger(state.currentIndex) &&
      Boolean(ROWS[state.currentRow]?.dots[state.currentIndex])
    );
  }

  function readOfficialFastMode(surface) {
    const scopedControl = surface?.querySelector(FAST_MODE_SELECTOR) || null;
    const control = scopedControl || [...document.querySelectorAll(FAST_MODE_SELECTOR)].find(isVisible);
    return (
      control?.getAttribute("data-fast-mode-enabled") === "true" ||
      control?.getAttribute("aria-checked") === "true"
    );
  }

  function snapshotSelection() {
    if (!hasSelectorSelection()) {
      if (state.recognizedRow && state.recognizedEffort) {
        return {
          rowIndex: null,
          indexInRow: null,
          modelName: state.recognizedRow.name,
          effort: state.recognizedEffort,
          fastMode: false,
        };
      }
      return {
        rowIndex: null,
        indexInRow: null,
        modelName: "Other",
        effort: null,
        fastMode: false,
      };
    }

    const rowIndex = state.currentRow;
    const indexInRow = state.currentIndex;
    const row = ROWS[rowIndex];
    return {
      rowIndex,
      indexInRow,
      modelName: row.name,
      effort: EFFORTS[row.dots[indexInRow] - 1],
      fastMode: Boolean(state.fastMode),
    };
  }

  function selectionsEqual(left, right) {
    return Boolean(left && right) &&
      left.rowIndex === right.rowIndex &&
      left.indexInRow === right.indexInRow &&
      left.modelName === right.modelName &&
      left.effort === right.effort &&
      Boolean(left.fastMode) === Boolean(right.fastMode);
  }

  function applySelection(selection, { render = true } = {}) {
    const rowIndex = Number.isInteger(selection?.rowIndex)
      ? selection.rowIndex
      : ROWS.findIndex((row) =>
          rowMatchesDisplayName(row, selection?.modelName) ||
          row.name.toLocaleLowerCase() ===
            String(selection?.modelName || "").toLocaleLowerCase(),
        );
    const effortIndex = EFFORTS.indexOf(String(selection?.effort || ""));
    const valid =
      rowIndex >= 0 &&
      effortIndex >= 0 &&
      ROWS[rowIndex].dots.includes(effortIndex + 1);
    const recognizedRow = valid
      ? ROWS[rowIndex]
      : ALL_ROWS.find((row) =>
          rowMatchesDisplayName(row, selection?.modelName) ||
          row.name.toLocaleLowerCase() ===
            String(selection?.modelName || "").toLocaleLowerCase(),
        ) || null;
    const recognized =
      Boolean(recognizedRow) &&
      effortIndex >= 0 &&
      recognizedRow.dots.includes(effortIndex + 1);

    state.currentRow = valid ? rowIndex : null;
    state.currentIndex = valid ? effortIndex : null;
    state.recognizedRow = recognized ? recognizedRow : null;
    state.recognizedEffort = recognized ? EFFORTS[effortIndex] : null;
    state.fastMode = Boolean(
      valid && ROWS[rowIndex].supportsFast && selection?.fastMode,
    );
    if (render && state.popoverHost) updateSelectorUI(state.popoverHost);
    return valid;
  }

  function markSelectionChanged(host) {
    if (hasSelectorSelection()) {
      const row = ROWS[state.currentRow];
      state.recognizedRow = row;
      state.recognizedEffort = EFFORTS[row.dots[state.currentIndex] - 1];
      if (!row.supportsFast) state.fastMode = false;
    }
    state.selectionRevision += 1;
    state.lastSwitchError = null;
    updateSelectorUI(host);
  }

  function setSwitchState(value) {
    state.switchState = value;
    state.popoverHost?.setAttribute("data-switch-state", value);
  }

  function isValidThreadID(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      String(value || ""),
    );
  }

  function resolveCurrentThreadID(trigger) {
    const composer = trigger?.closest("[data-codex-composer-root]") || null;
    const directCandidates = [
      trigger?.closest(CONVERSATION_CONTEXT_SELECTOR),
      composer?.closest(CONVERSATION_CONTEXT_SELECTOR),
      composer?.querySelector(CONVERSATION_CONTEXT_SELECTOR),
    ].filter(Boolean);
    const documentCandidates = [...document.querySelectorAll(CONVERSATION_CONTEXT_SELECTOR)];
    const candidates = [...new Set([...directCandidates, ...documentCandidates])];
    const validCandidates = candidates
      .map((element) => ({
        element,
        threadID: element.getAttribute("data-above-composer-conversation-id"),
      }))
      .filter(({ threadID }) => isValidThreadID(threadID));
    if (validCandidates.length === 0) return null;
    if (validCandidates.length === 1) return validCandidates[0].threadID;

    const triggerRect = trigger?.getBoundingClientRect();
    return validCandidates
      .sort((left, right) => {
        const score = ({ element }) => {
          if (element.contains(trigger)) return -100000;
          if (!triggerRect) return 0;
          const rect = element.getBoundingClientRect();
          return Math.hypot(
            rect.left + rect.width / 2 - (triggerRect.left + triggerRect.width / 2),
            rect.top + rect.height / 2 - (triggerRect.top + triggerRect.height / 2),
          );
        };
        return score(left) - score(right);
      })[0].threadID;
  }

  function makeRequestID() {
    if (typeof crypto?.randomUUID === "function") {
      return `model-rail-${crypto.randomUUID()}`;
    }
    return `model-rail-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function sendAppServerRequest(method, params) {
    const allowedMethods = new Set(["model/list", "thread/settings/update"]);
    if (!allowedMethods.has(method)) {
      return Promise.reject(new Error("Copicker rejected an unsupported app-server method."));
    }

    const bridge = window.electronBridge;
    if (typeof bridge?.sendMessageFromView !== "function") {
      return Promise.reject(new Error("Codex renderer bridge is unavailable."));
    }

    const id = makeRequestID();
    return new Promise((resolve, reject) => {
      const timeoutID = window.setTimeout(() => {
        state.pendingRequests.delete(id);
        reject(new Error(`${method} timed out.`));
      }, APP_SERVER_REQUEST_TIMEOUT_MS);
      state.pendingRequests.set(id, { method, resolve, reject, timeoutID });

      try {
        bridge.sendMessageFromView({
          type: "mcp-request",
          hostId: APP_SERVER_HOST_ID,
          request: { id, method, params },
          priority: method === "thread/settings/update" ? "critical" : "background",
          source: method === "thread/settings/update" ? "thread" : "model",
          timeoutMs: APP_SERVER_REQUEST_TIMEOUT_MS,
          expiresAtMs: Date.now() + APP_SERVER_REQUEST_TIMEOUT_MS,
        });
      } catch (error) {
        window.clearTimeout(timeoutID);
        state.pendingRequests.delete(id);
        reject(error);
      }
    });
  }

  function normalizedModelCatalog(result) {
    const models = Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result?.models)
        ? result.models
        : [];
    return ROWS.map((row, rowIndex) => {
      const model = models.find((candidate) =>
        rowMatchesDisplayName(row, candidate?.displayName),
      );
      if (!model || typeof model.model !== "string" || model.model.length === 0) {
        return null;
      }

      const supportedEfforts = new Set(
        (model.supportedReasoningEfforts || [])
          .map((entry) =>
            typeof entry === "string"
              ? entry
              : entry?.reasoningEffort || entry?.effort || null,
          )
          .filter(Boolean),
      );
      const requiredEfforts = row.dots.map((dotNumber) => EFFORTS[dotNumber - 1]);
      if (requiredEfforts.some((effort) => !supportedEfforts.has(effort))) {
        return null;
      }

      const fastTier = (model.serviceTiers || []).find(
        (tier) => String(tier?.name || "").toLocaleLowerCase() === "fast",
      );
      return {
        rowIndex,
        model: model.model,
        displayName: model.displayName,
        supportedEfforts,
        fastTierID: row.supportsFast
          ? fastTier?.id || fastTier?.serviceTier || null
          : null,
      };
    });
  }

  function ensureModelCatalog() {
    if (state.modelCatalog) return Promise.resolve(state.modelCatalog);
    if (state.modelCatalogPromise) return state.modelCatalogPromise;

    setSwitchState("loading");
    state.modelCatalogPromise = sendAppServerRequest("model/list", {
      cursor: null,
      includeHidden: false,
      limit: 100,
    })
      .then((result) => {
        state.modelCatalog = normalizedModelCatalog(result);
        setSwitchState(state.currentThreadID ? "ready" : "no-thread");
        return state.modelCatalog;
      })
      .catch((error) => {
        state.lastSwitchError = error;
        setSwitchState("error");
        throw error;
      })
      .finally(() => {
        state.modelCatalogPromise = null;
      });
    return state.modelCatalogPromise;
  }

  function selectionFromThreadSettings(settings) {
    if (!settings || !state.modelCatalog) return null;
    const catalogEntry = state.modelCatalog.find(
      (entry) => entry?.model === settings.model,
    );
    if (!catalogEntry) {
      return {
        rowIndex: null,
        indexInRow: null,
        modelName: "Other",
        effort: null,
        fastMode: false,
      };
    }

    const effort = settings.effort || settings.reasoningEffort || null;
    const effortIndex = EFFORTS.indexOf(effort);
    const row = ROWS[catalogEntry.rowIndex];
    if (effortIndex < 0 || !row.dots.includes(effortIndex + 1)) return null;
    return {
      rowIndex: catalogEntry.rowIndex,
      indexInRow: effortIndex,
      modelName: row.name,
      effort,
      fastMode: Boolean(
        row.supportsFast &&
        catalogEntry.fastTierID &&
        settings.serviceTier === catalogEntry.fastTierID,
      ),
    };
  }

  function createSettingsWaiter(threadID, target) {
    let timeoutID = null;
    let waiter = null;
    const promise = new Promise((resolve, reject) => {
      waiter = { threadID, target, resolve, reject };
      timeoutID = window.setTimeout(() => {
        state.settingsWaiters.delete(waiter);
        reject(new Error("Codex did not confirm the thread settings update."));
      }, SETTINGS_CONFIRMATION_TIMEOUT_MS);
      waiter.timeoutID = timeoutID;
      state.settingsWaiters.add(waiter);
    });
    void promise.catch(() => {});
    return {
      promise,
      cancel() {
        if (!waiter) return;
        window.clearTimeout(timeoutID);
        state.settingsWaiters.delete(waiter);
      },
    };
  }

  function confirmSettingsNotification(threadID, settings) {
    if (threadID !== state.currentThreadID) return;
    const confirmed = selectionFromThreadSettings(settings);
    if (!confirmed) return;

    state.confirmedSelection = confirmed;
    for (const waiter of [...state.settingsWaiters]) {
      if (waiter.threadID !== threadID || !selectionsEqual(waiter.target, confirmed)) continue;
      window.clearTimeout(waiter.timeoutID);
      state.settingsWaiters.delete(waiter);
      waiter.resolve(confirmed);
    }
    if (!state.commitInFlight) {
      applySelection(confirmed);
      setSwitchState("confirmed");
    }
  }

  function handleBridgeMessage(event) {
    const envelope = event.data;
    if (!envelope || envelope.hostId !== APP_SERVER_HOST_ID) return;

    if (envelope.type === "mcp-response") {
      const response = envelope.message;
      const pending = state.pendingRequests.get(response?.id);
      if (!pending) return;
      event.stopImmediatePropagation();
      window.clearTimeout(pending.timeoutID);
      state.pendingRequests.delete(response.id);
      if (response.error) {
        const error = new Error(`${pending.method} failed.`);
        error.code = response.error.code;
        pending.reject(error);
      } else {
        pending.resolve(response.result);
      }
      return;
    }

    const notification = envelope.message || envelope;
    if (
      envelope.type === "mcp-notification" &&
      notification.method === "thread/settings/updated"
    ) {
      confirmSettingsNotification(
        notification.params?.threadId,
        notification.params?.threadSettings,
      );
    }
  }

  function officialSelectionFromDOM() {
    const trigger = state.trigger?.isConnected ? state.trigger : findOpenTrigger();
    if (!trigger) return null;
    const text = String(trigger.textContent || "").replace(/\s+/g, " ").trim();
    const rowIndex = ROWS.findIndex((row) => rowMatchesTriggerText(row, text));
    const effort = trigger.getAttribute("data-selected-reasoning-effort") || "";
    const effortIndex = EFFORTS.indexOf(effort);
    if (
      rowIndex < 0 ||
      effortIndex < 0 ||
      !ROWS[rowIndex].dots.includes(effortIndex + 1)
    ) {
      return null;
    }
    return {
      rowIndex,
      indexInRow: effortIndex,
      modelName: ROWS[rowIndex].name,
      effort,
      fastMode: Boolean(
        ROWS[rowIndex].supportsFast && readOfficialFastMode(state.primarySurface),
      ),
    };
  }

  async function performSelectionCommit(selection, revision, { force = false } = {}) {
    if (!Number.isInteger(selection?.rowIndex) || !selection.effort) {
      throw new Error("A supported model and effort must be selected.");
    }
    if (revision < state.selectionRevision) return { skipped: "superseded" };

    const threadID = state.currentThreadID || resolveCurrentThreadID(state.trigger);
    if (!threadID) {
      setSwitchState("no-thread");
      throw new Error("The current Codex task has no thread identifier yet.");
    }
    state.currentThreadID = threadID;

    const catalog = await ensureModelCatalog();
    const catalogEntry = catalog[selection.rowIndex];
    if (!catalogEntry?.supportedEfforts.has(selection.effort)) {
      throw new Error("The selected model or effort is unavailable.");
    }
    if (selection.fastMode && !catalogEntry.fastTierID) {
      throw new Error("Fast is unavailable for the selected model.");
    }

    const previousConfirmed = state.confirmedSelection;
    const sameAsConfirmed = selectionsEqual(previousConfirmed, selection);
    if (sameAsConfirmed && !force) {
      setSwitchState("confirmed");
      return { confirmed: true, unchanged: true };
    }

    const confirmation = sameAsConfirmed
      ? null
      : createSettingsWaiter(threadID, selection);
    state.commitInFlight = true;
    setSwitchState("pending");
    try {
      await sendAppServerRequest("thread/settings/update", {
        threadId: threadID,
        model: catalogEntry.model,
        effort: selection.effort,
        serviceTier: selection.fastMode ? catalogEntry.fastTierID : null,
      });

      if (confirmation) {
        try {
          await confirmation.promise;
        } catch (confirmationError) {
          const officialSelection = officialSelectionFromDOM();
          if (!selectionsEqual(officialSelection, selection)) throw confirmationError;
        }
      }

      state.confirmedSelection = { ...selection };
      state.lastSwitchError = null;
      setSwitchState("confirmed");
      return { confirmed: true, unchanged: sameAsConfirmed };
    } catch (error) {
      confirmation?.cancel();
      state.lastSwitchError = error;
      if (revision === state.selectionRevision && previousConfirmed) {
        applySelection(previousConfirmed);
      }
      setSwitchState("error");
      throw error;
    } finally {
      confirmation?.cancel();
      state.commitInFlight = false;
    }
  }

  function enqueueSelectionCommit(options = {}) {
    const selection = snapshotSelection();
    const revision = state.selectionRevision;
    const task = state.commitQueue
      .catch(() => {})
      .then(() => performSelectionCommit(selection, revision, options));
    state.commitQueue = task.catch(() => {});
    return task;
  }

  function scheduleSelectionCommit() {
    window.clearTimeout(state.commitTimer);
    state.commitTimer = window.setTimeout(() => {
      state.commitTimer = null;
      void enqueueSelectionCommit().catch(() => {});
    }, KEYBOARD_COMMIT_DELAY_MS);
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

  function updateEndpointVisibility(shadow) {
    const activeEffortLabel = shadow.querySelector(".effort-label.active");
    const activeRects = activeEffortLabel
      ? [activeEffortLabel.getBoundingClientRect()]
      : [];
    const activeFastLabel = activeEffortLabel?.querySelector(".effort-fast") || null;
    if (activeEffortLabel?.classList.contains("fast") && activeFastLabel) {
      activeRects.push(activeFastLabel.getBoundingClientRect());
    }
    const activeModelLabel = activeEffortLabel?.querySelector(".effort-model") || null;
    if (activeModelLabel) activeRects.push(activeModelLabel.getBoundingClientRect());

    const activeRect = activeRects.length > 0
      ? {
          left: Math.min(...activeRects.map((rect) => rect.left)),
          right: Math.max(...activeRects.map((rect) => rect.right)),
          top: Math.min(...activeRects.map((rect) => rect.top)),
          bottom: Math.max(...activeRects.map((rect) => rect.bottom)),
        }
      : null;

    for (const endpoint of shadow.querySelectorAll(".effort-endpoint")) {
      const endpointRect = endpoint.getBoundingClientRect();
      endpoint.classList.toggle(
        "obscured",
        Boolean(activeRect) && overlaps(activeRect, endpointRect),
      );
    }
  }

  function configureModelText(element, row) {
    if (!element || !row) return;
    element.textContent = row.name;
    element.setAttribute("data-model", row.name);
    element.classList.toggle("daybreak", row.id === "daybreak-blue");
    if (row.id === "daybreak-blue") {
      element.style.removeProperty("--model-text-light");
      element.style.removeProperty("--model-text-dark");
      return;
    }
    element.style.setProperty("--model-text-light", row.textColors[0]);
    element.style.setProperty("--model-text-dark", row.textColors[1]);
  }

  function renderInactiveStatus(element, row, effort) {
    if (!element) return;
    element.replaceChildren();
    element.classList.toggle("recognized", Boolean(row && effort));
    if (!row || !effort) {
      element.textContent = "Other";
      return;
    }
    const model = document.createElement("span");
    model.className = `recognized-model${row.id === "daybreak-blue" ? " daybreak" : ""}`;
    model.textContent = row.name;
    const effortLabel = document.createElement("span");
    effortLabel.className = "recognized-effort";
    effortLabel.textContent = effort;
    element.append(model, effortLabel);
  }

  function updateSelectorUI(host) {
    const shadow = host.shadowRoot;
    if (!shadow) return;

    const selection = shadow.querySelector("#selection");
    const thumb = shadow.querySelector("#thumb");
    const otherElement = shadow.querySelector(".other-label");
    const modelElement = shadow.querySelector(".current-selection .model");
    const effortElement = shadow.querySelector(".current-selection .effort");
    const fastElement = shadow.querySelector(".current-selection .fast-status");
    const selected = hasSelectorSelection();
    const recognizedRow = state.recognizedRow;
    const recognizedEffort = state.recognizedEffort;
    otherElement?.classList.toggle("active", !selected);
    otherElement?.setAttribute("aria-hidden", String(selected));

    if (!selected) {
      const recognized = Boolean(recognizedRow && recognizedEffort);
      host.setAttribute("data-selector-model", recognized ? recognizedRow.name : "Other");
      host.setAttribute("data-selector-effort", recognized ? recognizedEffort : "");
      host.setAttribute("data-selector-fast", "false");
      host.setAttribute("data-selector-fast-available", "false");
      host.setAttribute("data-selector-has-selection", "false");
      host.setAttribute("data-selector-recognized", String(recognized));
      selection?.classList.add("inactive");
      thumb?.classList.add("inactive");
      thumb?.classList.remove("fast");
      thumb?.classList.remove("fast-unavailable");
      for (const dot of shadow.querySelectorAll(".dot")) {
        dot.classList.remove("inside");
      }
      for (const label of shadow.querySelectorAll(".effort-label")) {
        label.classList.remove("active");
        label.classList.remove("fast");
      }
      updateEndpointVisibility(shadow);
      renderInactiveStatus(otherElement, recognizedRow, recognizedEffort);
      if (modelElement) modelElement.textContent = recognized ? recognizedRow.name : "Other";
      if (effortElement) {
        effortElement.textContent = recognized ? recognizedEffort : "";
        effortElement.classList.toggle("ultra", recognizedEffort === "ultra");
      }
      fastElement?.classList.remove("active");
      shadow.querySelector("#stage")?.setAttribute(
        "aria-label",
        recognized
          ? `${recognizedRow.name}, ${recognizedEffort}, hidden from selector`
          : "2D selector, no recognized selection",
      );
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
    host.setAttribute("data-selector-fast-available", String(row.supportsFast));
    host.setAttribute("data-selector-has-selection", "true");
    host.setAttribute("data-selector-recognized", "true");

    if (thumb) {
      thumb.classList.remove("inactive");
      thumb.classList.toggle("fast", state.fastMode);
      thumb.classList.toggle("fast-unavailable", !row.supportsFast);
      thumb.style.left = `${x}px`;
      thumb.style.top = `${y}px`;
    }
    if (selection) {
      selection.classList.remove("inactive");
      selection.style.width = `${Math.max(ROW_HEIGHT, width - START_INSET)}px`;
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
    for (const modelLabel of shadow.querySelectorAll(".effort-model")) {
      configureModelText(modelLabel, row);
    }
    for (const [index, label] of [...shadow.querySelectorAll(".effort-label")].entries()) {
      const active = index === dotNumber - 1;
      label.classList.toggle("active", active);
      label.classList.toggle("fast", active && state.fastMode);
    }
    updateEndpointVisibility(shadow);

    if (modelElement) modelElement.textContent = row.name;
    if (effortElement) {
      effortElement.textContent = effort;
      effortElement.classList.toggle("ultra", effort === "ultra");
    }
    fastElement?.classList.toggle("active", state.fastMode);
    shadow.querySelector("#stage")?.setAttribute(
      "aria-label",
      `${row.name}, ${effort}${
        row.supportsFast
          ? state.fastMode ? ", Fast" : ""
          : ", Fast unavailable"
      }`,
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
    const nextRow = nearestRowFromY(scaledY);
    const nextIndex = nearestIndexInRow(nextRow, scaledX);
    if (state.currentRow === nextRow && state.currentIndex === nextIndex) return;
    state.currentRow = nextRow;
    state.currentIndex = nextIndex;
    markSelectionChanged(host);
  }

  function handleSelectorKey(host, event) {
    const isArrow = event.key.startsWith("Arrow");
    const isSpace = event.key === " " || event.key === "Spacebar" || event.code === "Space";
    if (!isArrow && !isSpace) return false;

    event.preventDefault();
    event.stopImmediatePropagation();

    if (isSpace) {
      if (
        !hasSelectorSelection() ||
        !ROWS[state.currentRow].supportsFast ||
        event.repeat
      ) {
        return true;
      }
      state.fastMode = !state.fastMode;
      markSelectionChanged(host);
      window.clearTimeout(state.commitTimer);
      state.commitTimer = null;
      void enqueueSelectionCommit().catch(() => {});
      return true;
    }

    if (!hasSelectorSelection()) {
      state.currentRow = 0;
      state.currentIndex = 0;
      state.fastMode = false;
      markSelectionChanged(host);
      scheduleSelectionCommit();
      return true;
    }

    const previousRow = state.currentRow;
    const previousIndex = state.currentIndex;

    if (event.key === "ArrowUp") {
      state.currentRow = Math.max(0, state.currentRow - 1);
      state.currentIndex = Math.min(
        state.currentIndex,
        ROWS[state.currentRow].dots.length - 1,
      );
    } else if (event.key === "ArrowDown") {
      state.currentRow = Math.min(ROWS.length - 1, state.currentRow + 1);
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
    if (state.currentRow !== previousRow || state.currentIndex !== previousIndex) {
      markSelectionChanged(host);
      scheduleSelectionCommit();
    }
    return true;
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
          width: ${HOST_WIDTH}px;
          height: ${HOST_HEIGHT}px;
          color-scheme: dark;
          --popover: rgb(44, 44, 44);
          --border: #444448;
          --text: #f3f3f4;
          --effort-text: #fff;
          --secondary-text: #8e8e93;
          --dot: #7e7e83;
          --dot-active: rgba(255, 255, 255, 0.36);
          --thumb: #f5f5f6;
          --daybreak-label: #70b9ff;
          --sol: #F7C6CC;
          --sol-light: #FBE1E5;
          --terra: #FFE6B8;
          --terra-light: #FFF1CF;
          --luna: #DDF3E4;
          --luna-light: #EEF9F1;
          --row-h: 48px;
          --row-gap: 16px;
          --row-count: ${ROWS.length};
          --thumb-size: 56px;
          --stage-w: 388px;
          --model-column-w: ${MODEL_COLUMN_WIDTH}px;
          --start-inset: 6px;
          --text-scale: 1.2;
          color: var(--text);
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display",
            "SF Pro Text", "PingFang SC", "Helvetica Neue", Arial, sans-serif;
        }

        :host([data-appearance-resolved="light"]) {
          color-scheme: light;
          --popover: rgb(255, 255, 255);
          --border: #d8d8dc;
          --text: #242426;
          --effort-text: #2f3033;
          --secondary-text: #77777d;
          --dot: #a1a1a7;
          --dot-active: rgba(35, 35, 40, 0.30);
          --thumb: #f8f8f9;
          --daybreak-label: #176fbd;
        }

        * { box-sizing: border-box; }

        .popover {
          position: relative;
          top: -4px;
          width: ${POPOVER_INNER_WIDTH}px;
          padding: 40px 26px 17.5px;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0)),
            var(--popover);
          border: 1px solid var(--border);
          border-radius: 24px;
          box-shadow:
            0 24px 70px rgba(0, 0, 0, 0.42),
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
          transform: scale(0.5);
          transform-origin: top left;
          user-select: none;
        }

        :host([data-appearance-resolved="light"]) .popover {
          background: rgb(255, 255, 255);
          box-shadow:
            0 24px 70px rgba(0, 0, 0, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.80);
        }

        .main {
          display: grid;
          grid-template-columns: var(--model-column-w) var(--stage-w);
          column-gap: 0;
          align-items: start;
        }

        .labels {
          height: ${STAGE_HEIGHT}px;
          margin-top: 34px;
          display: grid;
          grid-template-rows: repeat(var(--row-count), var(--row-h));
          row-gap: var(--row-gap);
        }

        .label {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 28px;
          font-size: calc(22px * var(--text-scale));
          font-weight: 650;
          letter-spacing: -0.03em;
        }

        .label.daybreak { color: var(--daybreak-label); }

        .stage-shell {
          position: relative;
          width: var(--stage-w);
          padding-top: 34px;
        }

        .effort-labels {
          position: absolute;
          left: 0;
          top: -22px;
          width: var(--stage-w);
          height: 30px;
          pointer-events: none;
        }

        .effort-label {
          position: absolute;
          top: 0;
          color: var(--effort-text);
          font-size: calc(22px * var(--text-scale));
          font-weight: 650;
          letter-spacing: -0.03em;
          line-height: 1.2;
          opacity: 0;
          transform: translateX(-50%);
          transition: opacity 180ms ease;
          white-space: nowrap;
        }

        .effort-label.ultra { color: #A67DF2; }
        .effort-label.active { opacity: 1; }

        .other-label {
          position: absolute;
          left: 50%;
          top: 18px;
          z-index: 1;
          color: var(--secondary-text);
          font-size: calc(22px * var(--text-scale));
          font-weight: 650;
          letter-spacing: -0.03em;
          line-height: 1.2;
          opacity: 0;
          pointer-events: none;
          transform: translateX(-50%);
          transition: opacity 160ms ease;
          white-space: nowrap;
        }

        .other-label.active { opacity: 1; }

        .other-label.recognized {
          display: flex;
          align-items: baseline;
          gap: 7px;
        }

        .recognized-model.daybreak { color: var(--daybreak-label); }
        .recognized-effort { color: var(--secondary-text); }

        .effort-model {
          position: absolute;
          right: calc(100% + 7px);
          bottom: 0;
          color: transparent;
          font: inherit;
          letter-spacing: inherit;
          line-height: inherit;
          background: linear-gradient(
            90deg,
            var(--model-text-light),
            var(--model-text-dark)
          );
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          white-space: nowrap;
        }

        .effort-model[data-model="Sol"] {
          --model-text-light: #f1c0c9;
          --model-text-dark: #edb7c1;
        }

        .effort-model[data-model="Terra"] {
          --model-text-light: #f0d69b;
          --model-text-dark: #ebcd90;
        }

        .effort-model[data-model="Luna"] {
          --model-text-light: #c1e2cb;
          --model-text-dark: #b7dcc3;
        }

        .effort-model.daybreak {
          color: var(--daybreak-label);
          background: none;
          -webkit-text-fill-color: currentColor;
        }

        .effort-fast {
          position: absolute;
          left: calc(100% + 7px);
          bottom: 0;
          color: #0099ff;
          font: inherit;
          letter-spacing: inherit;
          line-height: inherit;
          opacity: 0;
          pointer-events: none;
          transition: opacity 120ms ease;
        }

        .effort-label.fast .effort-fast { opacity: 1; }

        .effort-endpoint {
          position: absolute;
          top: calc(3.6px * var(--text-scale));
          color: var(--secondary-text);
          font-size: calc(19px * var(--text-scale));
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.2;
          opacity: 1;
          white-space: nowrap;
          transition: opacity 120ms ease;
        }

        .effort-endpoint.faster { left: -90px; }
        .effort-endpoint.smarter { right: -47.5px; }
        .effort-endpoint.obscured { opacity: 0; }

        .stage {
          position: relative;
          width: var(--stage-w);
          height: ${STAGE_HEIGHT}px;
          cursor: pointer;
          touch-action: none;
          outline: none;
        }

        .selection {
          position: absolute;
          left: var(--start-inset);
          bottom: 0;
          width: 0;
          height: var(--row-h);
          border-radius: 24px;
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
            opacity 160ms ease,
            background 240ms ease;
        }

        .selection.inactive { opacity: 0; }

        :host([data-appearance-resolved="light"]) .selection {
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.40),
            0 10px 24px rgba(0, 0, 0, 0.08);
        }

        .dot {
          position: absolute;
          width: 7px;
          height: 7px;
          border-radius: 50%;
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
          border-radius: 50%;
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

        :host([data-appearance-resolved="light"]) .thumb {
          box-shadow:
            0 10px 22px rgba(0, 0, 0, 0.18),
            0 2px 6px rgba(0, 0, 0, 0.10),
            inset 0 0 0 1px rgba(0, 0, 0, 0.08);
        }

        .thumb::after {
          content: "";
          position: absolute;
          inset: 17%;
          background: rgba(74, 74, 80, 0.28);
          opacity: 0;
          -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M13 1.5V9h6.5L11 22.5V15H4.5L13 1.5Z' fill='black'/%3E%3C/svg%3E") center / contain no-repeat;
          mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M13 1.5V9h6.5L11 22.5V15H4.5L13 1.5Z' fill='black'/%3E%3C/svg%3E") center / contain no-repeat;
          transition: opacity 160ms ease;
        }

        .thumb.fast::after { opacity: 1; }
        .thumb.fast-unavailable::after { opacity: 0; }

        .stage.dragging .thumb {
          transform: translate(-50%, -50%) scale(1.02);
        }

        .current-selection {
          display: none;
          margin-top: 18px;
          padding-left: 90px;
          min-height: 26px;
          font-size: calc(19px * var(--text-scale));
          font-weight: 600;
          line-height: 26px;
          letter-spacing: -0.015em;
        }

        .current-selection .model { color: var(--text); }

        .current-selection .effort {
          margin-left: 7px;
          color: var(--secondary-text);
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
          .other-label,
          .current-selection .effort,
          .current-selection .fast-status { transition: none; }
        }
      </style>
      <section class="popover" data-design="preview-2d" aria-label="Copicker">
        <div class="other-label" aria-hidden="true">Other</div>
        <div class="main">
          <div class="labels" id="modelLabels"></div>
          <div class="stage-shell">
            <div class="effort-labels" id="effortLabels">
              <div class="effort-endpoint faster">Faster</div>
              <div class="effort-endpoint smarter">Smarter</div>
            </div>
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
    const modelLabels = shadow.querySelector("#modelLabels");
    const thumb = shadow.querySelector("#thumb");

    for (const row of ROWS) {
      const label = document.createElement("div");
      label.className = `label${row.id === "daybreak-blue" ? " daybreak" : ""}`;
      label.textContent = row.name;
      modelLabels?.append(label);
    }

    for (const [index, effort] of EFFORTS.entries()) {
      const label = document.createElement("div");
      label.className = `effort-label${effort === "ultra" ? " ultra" : ""}`;
      const modelLabel = document.createElement("span");
      modelLabel.className = "effort-model";
      configureModelText(modelLabel, ROWS[state.currentRow ?? 0]);
      label.append(modelLabel);
      label.append(document.createTextNode(effort));
      const fastLabel = document.createElement("span");
      fastLabel.className = "effort-fast";
      fastLabel.textContent = "Fast";
      label.append(fastLabel);
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
        let shouldCommit = true;
        if (pointerDownOnThumb && !pointerMoved) {
          if (ROWS[state.currentRow]?.supportsFast) {
            state.fastMode = !state.fastMode;
            markSelectionChanged(host);
          } else {
            shouldCommit = false;
          }
        } else {
          updateFromPointer(host, event.clientX, event.clientY);
        }
        stage.releasePointerCapture(event.pointerId);
        window.clearTimeout(state.commitTimer);
        state.commitTimer = null;
        if (shouldCommit) void enqueueSelectionCommit().catch(() => {});
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

    shadow.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
    shadow.addEventListener("click", (event) => event.stopPropagation());
    updateSelectorUI(host);
  }

  function systemAppearance() {
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  function codexAppearance() {
    const root = document.documentElement;
    const explicitTheme = [
      root.getAttribute("data-theme"),
      root.getAttribute("data-color-scheme"),
      root.className,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();
    if (/(^|\s)light($|\s)/.test(explicitTheme)) return "light";
    if (/(^|\s)dark($|\s)/.test(explicitTheme)) return "dark";

    const colorScheme = getComputedStyle(root).colorScheme.toLocaleLowerCase();
    if (colorScheme === "light") return "light";
    if (colorScheme === "dark") return "dark";

    const background = getComputedStyle(document.body).backgroundColor;
    const channels = background.match(/[\d.]+/g)?.slice(0, 3).map(Number) || [];
    if (channels.length === 3) {
      const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
      return luminance >= 170 ? "light" : "dark";
    }
    return systemAppearance();
  }

  function resolvedAppearance() {
    if (CONFIG.appearance === "light" || CONFIG.appearance === "dark") {
      return CONFIG.appearance;
    }
    return CONFIG.appearance === "system" ? systemAppearance() : codexAppearance();
  }

  function updatePopoverAppearance() {
    const host = state.popoverHost;
    if (!host) return;
    host.setAttribute("data-appearance", CONFIG.appearance);
    host.setAttribute("data-appearance-resolved", resolvedAppearance());
  }

  function placementsEqual(left, right) {
    return Boolean(left && right) &&
      left.placement === right.placement &&
      left.placementVariant === right.placementVariant &&
      Math.abs(left.x - right.x) < 1 &&
      Math.abs(left.y - right.y) < 1;
  }

  function cancelPlacementReturn() {
    window.clearTimeout(state.placementReturnTimer);
    state.placementReturnTimer = null;
  }

  function resetPlacementSession() {
    cancelPlacementReturn();
    state.latchedPlacement = null;
    state.pointerInsidePopover = false;
    state.pointerVisitedPopover = false;
  }

  function schedulePlacementReturn() {
    if (
      CONFIG.preferredPlacement === "top" ||
      state.pointerInsidePopover ||
      !state.pointerVisitedPopover ||
      state.placementReturnTimer
    ) {
      return;
    }
    state.placementReturnTimer = window.setTimeout(() => {
      state.placementReturnTimer = null;
      if (state.pointerInsidePopover) return;
      state.latchedPlacement = null;
      scheduleSync();
    }, PLACEMENT_RETURN_DELAY_MS);
  }

  function ensureDetachedPopover() {
    let host = document.getElementById(POPOVER_HOST_ID);
    const isNew = !host;
    if (!host) {
      host = document.createElement("div");
      host.id = POPOVER_HOST_ID;
    }

    window.clearTimeout(state.closeTimer);
    state.closeTimer = null;

    host.setAttribute("data-codex-model-rail-popover", VERSION);
    host.setAttribute("data-prototype", "false");
    host.setAttribute("data-visual-pending", "false");
    host.setAttribute("data-local-only", "false");
    host.setAttribute("data-switch-mode", "thread-settings-update");
    host.setAttribute("data-switch-state", state.switchState);
    host.setAttribute("data-keyboard-navigation", "arrows-space");
    host.setAttribute("data-design-source", "preview.html");
    host.setAttribute("data-preferred-placement", CONFIG.preferredPlacement);
    host.setAttribute("data-config-signature", CONFIG_SIGNATURE);
    host.style.position = "fixed";
    host.style.margin = "0";
    host.style.zIndex = "2147483000";
    host.style.transformOrigin = "50% 100%";
    host.style.transition = [
      `opacity ${POPOVER_ANIMATION_MS - 20}ms ease`,
      `transform ${POPOVER_ANIMATION_MS}ms cubic-bezier(0.22, 0.86, 0.2, 1)`,
      `left ${POPOVER_ANIMATION_MS}ms cubic-bezier(0.22, 0.86, 0.2, 1)`,
      `top ${POPOVER_ANIMATION_MS}ms cubic-bezier(0.22, 0.86, 0.2, 1)`,
    ].join(", ");

    if (isNew) {
      host.setAttribute("data-open-state", "opening");
      host.setAttribute("aria-hidden", "true");
      host.style.left = "0px";
      host.style.top = "0px";
      host.style.opacity = "0";
      host.style.pointerEvents = "none";
      host.style.transform = "translateY(6px) scale(0.98)";
      host.style.visibility = "hidden";
      host.addEventListener("pointerenter", () => {
        state.pointerInsidePopover = true;
        cancelPlacementReturn();
      });
      host.addEventListener("pointerleave", () => {
        state.pointerInsidePopover = false;
        state.pointerVisitedPopover = true;
        scheduleSync();
      });
    }

    if (host.parentElement !== document.body) document.body.append(host);
    render2DSelector(host);
    state.popoverHost = host;
    updatePopoverAppearance();
    return host;
  }

  function revealDetachedPopover(host) {
    if (!host?.isConnected) return;
    host.setAttribute("aria-hidden", "false");
    host.style.pointerEvents = "auto";
    host.style.visibility = "visible";
    if (host.getAttribute("data-open-state") === "open") return;

    host.setAttribute("data-open-state", "opening");
    host.style.opacity = "0";
    host.style.transform = "translateY(6px) scale(0.98)";
    window.cancelAnimationFrame(state.revealFrame);
    state.revealFrame = window.requestAnimationFrame(() => {
      state.revealFrame = window.requestAnimationFrame(() => {
        if (
          !host.isConnected ||
          host.getAttribute("data-position-state") !== "positioned"
        ) {
          return;
        }
        host.setAttribute("data-open-state", "open");
        host.style.opacity = "1";
        host.style.transform = "translateY(0) scale(1)";
        state.revealFrame = null;
      });
    });
  }

  function positionDetachedPopover() {
    const host = state.popoverHost;
    const surface = state.primarySurface;
    if (!host?.isConnected || !surface?.isConnected) return;

    const anchorRect = surface.getBoundingClientRect();
    const hostRect = host.getBoundingClientRect();
    const hostStyle = getComputedStyle(host);
    const popoverWidth = Number.parseFloat(hostStyle.width) || hostRect.width;
    const popoverHeight = Number.parseFloat(hostStyle.height) || hostRect.height;
    const obstacleSurfaces = findSecondaryMenuObstacleSurfaces(surface);
    for (const obstacleSurface of obstacleSurfaces) {
      state.resizeObserver?.observe(obstacleSurface);
    }
    const obstacleRects = obstacleSurfaces.map((obstacleSurface) =>
      obstacleSurface.getBoundingClientRect(),
    );
    const basePlacement = computePlacement(
      anchorRect,
      popoverWidth,
      popoverHeight,
      [],
      CONFIG.preferredPlacement,
    );
    let placement = state.latchedPlacement;
    if (
      !placementIsValid(
        placement,
        anchorRect,
        popoverWidth,
        popoverHeight,
        obstacleRects,
      )
    ) {
      cancelPlacementReturn();
      placement = computePlacement(
        anchorRect,
        popoverWidth,
        popoverHeight,
        obstacleRects,
        CONFIG.preferredPlacement,
      );
      state.latchedPlacement = placement;
    } else if (
      CONFIG.preferredPlacement !== "top" &&
      basePlacement &&
      !placementsEqual(placement, basePlacement) &&
      placementIsValid(
        basePlacement,
        anchorRect,
        popoverWidth,
        popoverHeight,
        obstacleRects,
      )
    ) {
      schedulePlacementReturn();
    }
    host.setAttribute(
      "data-placement-latched",
      String(Boolean(placement && !placementsEqual(placement, basePlacement))),
    );
    host.setAttribute("data-secondary-obstacle-count", String(obstacleRects.length));
    if (!placement) {
      host.setAttribute("data-placement", "none");
      host.setAttribute("data-placement-variant", "none");
      host.setAttribute("data-position-state", "hidden-no-fit");
      host.setAttribute("data-open-state", "hidden-no-fit");
      host.setAttribute("aria-hidden", "true");
      host.style.left = "-100000px";
      host.style.top = "-100000px";
      host.style.opacity = "0";
      host.style.transform = "translateY(6px) scale(0.98)";
      host.style.pointerEvents = "none";
      host.style.visibility = "hidden";
      state.latchedPlacement = null;
      return;
    }

    host.setAttribute("data-placement", placement.placement);
    host.setAttribute("data-placement-variant", placement.placementVariant);
    host.setAttribute("data-position-state", "positioned");
    const wasOpen = host.getAttribute("data-open-state") === "open";
    const animatedTransition = host.style.transition;
    if (!wasOpen) host.style.transition = "none";
    host.style.left = `${Math.round(placement.x)}px`;
    host.style.top = `${Math.round(placement.y)}px`;
    if (!wasOpen) {
      void host.offsetWidth;
      host.style.transition = animatedTransition;
    }
    revealDetachedPopover(host);
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
    if (shouldInitialize) {
      resetPlacementSession();
      initializeSelectorFromTrigger(target.trigger);
    }
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

  function handleWindowResize() {
    cancelPlacementReturn();
    state.latchedPlacement = null;
    scheduleSync();
  }

  state.observer = new MutationObserver(scheduleSync);
  state.observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["aria-expanded", "aria-controls", "data-state", "hidden"],
  });

  state.sync = scheduleSync;
  state.getConfig = () => ({
    ...CONFIG,
    visibleModels: [...CONFIG.visibleModels],
  });
  state.hasPrimaryTarget = () => Boolean(currentPrimaryTarget());
  state.getAnchorSurface = () => state.primarySurface;
  state.getPopoverHost = () => state.popoverHost;
  state.getSelection = () => {
    const selection = snapshotSelection();
    return {
      modelName: selection.modelName,
      effort: selection.effort,
      fastMode: selection.fastMode,
    };
  };
  state.setSelection = (modelName, effort, fastMode = false) => {
    const accepted = applySelection({ modelName, effort, fastMode }, { render: false });
    if (!accepted) return Promise.reject(new Error("Unsupported Copicker selection."));
    state.selectionRevision += 1;
    if (state.popoverHost) updateSelectorUI(state.popoverHost);
    window.clearTimeout(state.commitTimer);
    state.commitTimer = null;
    return enqueueSelectionCommit();
  };
  state.commitCurrentSelection = (options = {}) => enqueueSelectionCommit(options);
  state.previewPlacement = (
    width,
    height,
    preferredPlacement = CONFIG.preferredPlacement,
  ) => {
    if (!state.primarySurface) return null;
    return computePlacement(
      state.primarySurface.getBoundingClientRect(),
      width,
      height,
      findSecondaryMenuObstacleSurfaces(state.primarySurface).map((surface) =>
        surface.getBoundingClientRect(),
      ),
      preferredPlacement,
    );
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
    if (event.key === "Escape") {
      state.dismissForCurrentOpen();
      return;
    }
    const host = state.popoverHost;
    if (
      !host?.isConnected ||
      host.getAttribute("aria-hidden") === "true" ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey
    ) {
      return;
    }
    handleSelectorKey(host, event);
  };
  state.dispose = () => {
    state.disposed = true;
    state.observer?.disconnect();
    state.appearanceObserver?.disconnect();
    state.appearanceMedia?.removeEventListener?.("change", updatePopoverAppearance);
    window.clearTimeout(state.commitTimer);
    state.commitTimer = null;
    cancelPlacementReturn();
    window.removeEventListener("message", state.handleBridgeMessage, true);
    window.removeEventListener("resize", handleWindowResize);
    window.removeEventListener("scroll", scheduleSync, true);
    window.removeEventListener("blur", state.handleWindowBlur);
    document.removeEventListener("visibilitychange", state.handleVisibilityChange);
    document.removeEventListener("keydown", state.handleKeyDown, true);
    for (const pending of state.pendingRequests.values()) {
      window.clearTimeout(pending.timeoutID);
      pending.reject(new Error("Copicker was disposed."));
    }
    state.pendingRequests.clear();
    for (const waiter of state.settingsWaiters) {
      window.clearTimeout(waiter.timeoutID);
      waiter.reject(new Error("Copicker was disposed."));
    }
    state.settingsWaiters.clear();
    removeDetachedPopover({ animated: false });
    removePreviousVisual();
    state.trigger = null;
    state.primarySurface = null;
    if (window[GLOBAL_KEY] === state) delete window[GLOBAL_KEY];
  };

  state.appearanceMedia = window.matchMedia("(prefers-color-scheme: light)");
  state.appearanceMedia.addEventListener?.("change", updatePopoverAppearance);
  state.appearanceObserver = new MutationObserver(updatePopoverAppearance);
  state.appearanceObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "style", "data-theme", "data-color-scheme"],
  });
  window.addEventListener("resize", handleWindowResize);
  window.addEventListener("scroll", scheduleSync, true);
  window.addEventListener("blur", state.handleWindowBlur);
  document.addEventListener("visibilitychange", state.handleVisibilityChange);
  document.addEventListener("keydown", state.handleKeyDown, true);
  state.handleBridgeMessage = handleBridgeMessage;
  window.addEventListener("message", state.handleBridgeMessage, true);
  window[GLOBAL_KEY] = state;
  scheduleSync();

  return {
    installed: true,
    reused: false,
    triggerFound: Boolean(currentPrimaryTarget()),
    primaryOnly: true,
    secondaryExcluded: false,
    secondaryAvoided: true,
    prototype: false,
    visualPending: false,
    localOnly: false,
    switchMode: "thread-settings-update",
    design: "preview-2d",
    version: VERSION,
  };
})();
