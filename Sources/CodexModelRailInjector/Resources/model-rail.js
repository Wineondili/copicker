(() => {
  "use strict";

  const VERSION = "0.9.0";
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
  const CONVERSATION_CONTEXT_SELECTOR = "[data-above-composer-conversation-id]";
  const FAST_MODE_SELECTOR = '[role="menuitemcheckbox"][data-fast-mode-enabled]';
  const APP_SERVER_HOST_ID = "local";
  const APP_SERVER_REQUEST_TIMEOUT_MS = 5000;
  const SETTINGS_CONFIRMATION_TIMEOUT_MS = 1800;
  const KEYBOARD_COMMIT_DELAY_MS = 120;
  const EFFORTS = ["low", "medium", "high", "xhigh", "max", "ultra"];
  const ROWS = [
    {
      name: "Sol",
      catalogDisplayName: "GPT-5.6-Sol",
      dots: [1, 2, 3, 4, 5, 6],
      colors: ["#FBE1E5", "#F7C6CC"],
    },
    {
      name: "Terra",
      catalogDisplayName: "GPT-5.6-Terra",
      dots: [1, 2, 3, 4, 5, 6],
      colors: ["#FFF1CF", "#FFE6B8"],
    },
    {
      name: "Luna",
      catalogDisplayName: "GPT-5.6-Luna",
      dots: [1, 2, 3, 4, 5],
      colors: ["#EEF9F1", "#DDF3E4"],
    },
  ];

  const ROW_HEIGHT = 48;
  const ROW_GAP = 16;
  const STAGE_WIDTH = 388;
  const STAGE_HEIGHT = ROW_HEIGHT * 3 + ROW_GAP * 2;
  const LEFT_PADDING = 34;
  const RIGHT_PADDING = 34;
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
      localOnly: false,
      switchMode: "thread-settings-update",
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
    state.fastMode = readOfficialFastMode(state.primarySurface);
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
      left.effort === right.effort &&
      Boolean(left.fastMode) === Boolean(right.fastMode);
  }

  function applySelection(selection, { render = true } = {}) {
    const rowIndex = Number.isInteger(selection?.rowIndex)
      ? selection.rowIndex
      : ROWS.findIndex((row) =>
          [row.name, row.catalogDisplayName]
            .map((value) => value.toLocaleLowerCase())
            .includes(String(selection?.modelName || "").toLocaleLowerCase()),
        );
    const effortIndex = EFFORTS.indexOf(String(selection?.effort || ""));
    const valid =
      rowIndex >= 0 &&
      effortIndex >= 0 &&
      ROWS[rowIndex].dots.includes(effortIndex + 1);

    state.currentRow = valid ? rowIndex : null;
    state.currentIndex = valid ? effortIndex : null;
    state.fastMode = valid && Boolean(selection?.fastMode);
    if (render && state.popoverHost) updateSelectorUI(state.popoverHost);
    return valid;
  }

  function markSelectionChanged(host) {
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
      return Promise.reject(new Error("Model Rail rejected an unsupported app-server method."));
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
      const model = models.find(
        (candidate) =>
          String(candidate?.displayName || "").toLocaleLowerCase() ===
          row.catalogDisplayName.toLocaleLowerCase(),
      );
      if (!model || typeof model.model !== "string" || model.model.length === 0) {
        throw new Error(`Required model ${row.catalogDisplayName} is unavailable.`);
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
        throw new Error(`Required effort levels for ${row.catalogDisplayName} are unavailable.`);
      }

      const fastTier = (model.serviceTiers || []).find(
        (tier) => String(tier?.name || "").toLocaleLowerCase() === "fast",
      );
      return {
        rowIndex,
        model: model.model,
        displayName: model.displayName,
        supportedEfforts,
        fastTierID: fastTier?.id || fastTier?.serviceTier || null,
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
      (entry) => entry.model === settings.model,
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
        catalogEntry.fastTierID && settings.serviceTier === catalogEntry.fastTierID,
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
    const rowIndex = ROWS.findIndex((row) =>
      new RegExp(`\\b${row.name}\\b`, "i").test(text),
    );
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
      fastMode: readOfficialFastMode(state.primarySurface),
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
        label.classList.remove("fast");
      }
      updateEndpointVisibility(shadow);
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
      modelLabel.textContent = row.name;
      modelLabel.setAttribute("data-model", row.name);
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
      if (!hasSelectorSelection() || event.repeat) return true;
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
          width: 289.75px;
          height: 134.75px;
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
          --stage-w: 388px;
          --start-inset: 6px;
          --text-scale: 1.2;
          color: var(--text);
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display",
            "SF Pro Text", "PingFang SC", "Helvetica Neue", Arial, sans-serif;
        }

        * { box-sizing: border-box; }

        .popover {
          position: relative;
          top: -4px;
          width: 579.5px;
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

        .main {
          display: grid;
          grid-template-columns: 90px var(--stage-w);
          column-gap: 0;
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
          font-size: calc(22px * var(--text-scale));
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
          top: -22px;
          width: var(--stage-w);
          height: 30px;
          pointer-events: none;
        }

        .effort-label {
          position: absolute;
          top: 0;
          color: #fff;
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
          color: #8e8e93;
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
          height: calc(var(--row-h) * 3 + var(--row-gap) * 2);
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
    const thumb = shadow.querySelector("#thumb");

    for (const [index, effort] of EFFORTS.entries()) {
      const label = document.createElement("div");
      label.className = `effort-label${effort === "ultra" ? " ultra" : ""}`;
      const modelLabel = document.createElement("span");
      modelLabel.className = "effort-model";
      modelLabel.textContent = ROWS[state.currentRow ?? 0].name;
      modelLabel.setAttribute("data-model", ROWS[state.currentRow ?? 0].name);
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
        if (pointerDownOnThumb && !pointerMoved) {
          state.fastMode = !state.fastMode;
          markSelectionChanged(host);
        } else {
          updateFromPointer(host, event.clientX, event.clientY);
        }
        stage.releasePointerCapture(event.pointerId);
        window.clearTimeout(state.commitTimer);
        state.commitTimer = null;
        void enqueueSelectionCommit().catch(() => {});
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

  function ensureDetachedPopover() {
    let host = document.getElementById(POPOVER_HOST_ID);
    if (!host) {
      host = document.createElement("div");
      host.id = POPOVER_HOST_ID;
    }

    host.setAttribute("data-codex-model-rail-popover", VERSION);
    host.setAttribute("data-prototype", "false");
    host.setAttribute("data-visual-pending", "false");
    host.setAttribute("data-local-only", "false");
    host.setAttribute("data-switch-mode", "thread-settings-update");
    host.setAttribute("data-switch-state", state.switchState);
    host.setAttribute("data-keyboard-navigation", "arrows-space");
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
    if (!accepted) return Promise.reject(new Error("Unsupported Model Rail selection."));
    state.selectionRevision += 1;
    if (state.popoverHost) updateSelectorUI(state.popoverHost);
    window.clearTimeout(state.commitTimer);
    state.commitTimer = null;
    return enqueueSelectionCommit();
  };
  state.commitCurrentSelection = (options = {}) => enqueueSelectionCommit(options);
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
    window.clearTimeout(state.commitTimer);
    state.commitTimer = null;
    window.removeEventListener("message", state.handleBridgeMessage, true);
    window.removeEventListener("resize", scheduleSync);
    window.removeEventListener("scroll", scheduleSync, true);
    window.removeEventListener("blur", state.handleWindowBlur);
    document.removeEventListener("visibilitychange", state.handleVisibilityChange);
    document.removeEventListener("keydown", state.handleKeyDown, true);
    for (const pending of state.pendingRequests.values()) {
      window.clearTimeout(pending.timeoutID);
      pending.reject(new Error("Model Rail was disposed."));
    }
    state.pendingRequests.clear();
    for (const waiter of state.settingsWaiters) {
      window.clearTimeout(waiter.timeoutID);
      waiter.reject(new Error("Model Rail was disposed."));
    }
    state.settingsWaiters.clear();
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
  state.handleBridgeMessage = handleBridgeMessage;
  window.addEventListener("message", state.handleBridgeMessage, true);
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
    localOnly: false,
    switchMode: "thread-settings-update",
    design: "preview-2d",
    version: VERSION,
  };
})();
