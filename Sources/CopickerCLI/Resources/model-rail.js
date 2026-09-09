(() => {
  "use strict";

  const VERSION = "0.12.15";
  const GLOBAL_KEY = "__CODEX_MODEL_RAIL__";
  const SETTINGS_GLOBAL_KEY = "__COPICKER_SETTINGS_INTEGRATION__";
  const LEGACY_HOST_ID = "codex-model-rail-host";
  const POPOVER_HOST_ID = "codex-model-rail-popover-host";
  const SETTINGS_HOST_ID = "copicker-settings-host";
  const SETTINGS_BUTTON_ID = "copicker-settings-nav-button";
  const SETTINGS_SERVER_NAME = "copicker";
  const SETTINGS_READ_TOOL = "copicker_settings";
  const SETTINGS_SAVE_TOOL = "copicker_settings_save";
  const SETTINGS_APPLY_TOOL = "copicker_settings_apply";
  const POPOVER_GAP = 12;
  const VIEWPORT_PADDING = 12;
  const TRIGGER_SELECTOR =
    '[data-codex-intelligence-trigger][data-composer-navigation-target="reasoning"]';
  const PRIMARY_SURFACE_SELECTOR = '[data-radix-menu-content], [role="menu"]';
  const REASONING_SLIDER_SELECTOR = "[data-reasoning-slider]";
  const PRIMARY_CONTROL_SELECTOR =
    "[data-model-picker-power-slider], [data-model-picker-view-toggle]";
  const SECONDARY_SURFACE_SELECTOR = "[data-composer-overlay-floating-ui]";
  const SECONDARY_ITEM_SELECTOR = '[data-list-navigation-item="true"]';
  const OFFICIAL_MENU_ITEM_SELECTOR =
    '[data-list-navigation-item="true"], [role="menuitem"]';
  const OFFICIAL_SUBMENU_TRIGGER_SELECTOR =
    '[data-list-navigation-item="true"][aria-haspopup="menu"][aria-controls], ' +
    '[role="menuitem"][aria-haspopup="menu"][aria-controls]';
  const OFFICIAL_LEAF_ITEM_SELECTOR =
    '[data-list-navigation-item="true"]:not([aria-haspopup]), ' +
    '[role="menuitem"]:not([aria-haspopup])';
  const OFFICIAL_SELECTED_EFFORT_SELECTOR =
    '[data-reasoning-selected="true"]';
  const OFFICIAL_CHECK_ICON_SELECTOR = 'svg[width="17"][height="17"]';
  const MODEL_ROW_SELECTOR = "[data-model-picker-model-row]";
  const MODEL_LIST_VIEW_SELECTOR = "[data-model-picker-view]";
  const MODEL_RADIO_SELECTOR = '[role="menuitemradio"]';
  const CONVERSATION_CONTEXT_SELECTOR = "[data-above-composer-conversation-id]";
  const FAST_MODE_SELECTOR = '[role="menuitemcheckbox"][data-fast-mode-enabled]';
  const DAYBREAK_PROGRAM_CONTROL_SELECTOR =
    '[role="menuitemcheckbox"]:not([data-fast-mode-enabled])';
  const APP_SERVER_HOST_ID = "local";
  const APP_SERVER_REQUEST_TIMEOUT_MS = 5000;
  const SETTINGS_APPLY_REQUEST_TIMEOUT_MS = 12000;
  const SETTINGS_CONFIRMATION_TIMEOUT_MS = 1800;
  const OFFICIAL_CONTROL_TIMEOUT_MS = 2400;
  const OFFICIAL_POINTER_OPEN_GRACE_MS = 180;
  const OFFICIAL_TRANSIENT_CONTROL_TIMEOUT_MS = 3000;
  const SETTINGS_FRAME_STYLE_VARIABLES = [
    ["--color-background-primary", [
      "--color-background-surface",
      "--color-surface-tertiary",
      "--color-surface",
    ]],
    ["--color-background-secondary", [
      "--color-surface-elevated",
      "--color-surface-secondary",
    ]],
    ["--color-background-tertiary", ["--color-surface-secondary"]],
    ["--color-text-primary", ["--color-text"]],
    ["--color-text-secondary", ["--color-codex-description"]],
    ["--color-text-tertiary", [
      "--color-text-tertiary",
      "--color-codex-description",
    ]],
    ["--color-text-info", ["--color-text-info", "--color-chart-blue"]],
    ["--color-text-danger", ["--color-text-danger", "--color-chart-red"]],
    ["--color-text-warning", ["--color-text-warning"]],
    ["--color-border-primary", ["--color-border"]],
    ["--color-border-secondary", ["--color-border"]],
    ["--color-ring-primary", ["--color-ring"]],
    ["--font-sans", ["--font-sans"]],
    ["--font-weight-normal", ["--vscode-font-weight"]],
    ["--font-weight-medium", ["--font-weight-medium"]],
    ["--font-text-xs-size", ["--text-xs"]],
    ["--font-text-xs-line-height", ["--text-xs--line-height"]],
    ["--font-text-sm-size", ["--text-sm"]],
    ["--font-text-sm-line-height", ["--text-sm--line-height"]],
    ["--font-text-md-size", ["--text-base"]],
    ["--font-text-md-line-height", ["--text-base--line-height"]],
    ["--font-heading-lg-size", [
      "--font-heading-lg-size",
      "--text-heading-lg",
      "--text-2xl",
    ]],
    ["--font-heading-lg-line-height", [
      "--font-heading-lg-line-height",
    ]],
    ["--font-heading-lg-tracking", [
      "--font-heading-lg-tracking",
      "--text-2xl--letter-spacing",
    ]],
    ["--shadow-sm", ["--shadow-sm"]],
    ["--copicker-host-panel", [
      "--color-background-panel",
      "--color-background-primary-soft-alpha",
      "--color-surface-secondary",
    ]],
    ["--copicker-host-control-hover", [
      "--color-background-primary-ghost-hover",
    ]],
    ["--copicker-host-border-default", ["--color-border"]],
    ["--copicker-host-chart-blue", ["--color-chart-blue"]],
    ["--copicker-host-gray-zero", ["--gray-0"]],
  ];
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
      id: "astra",
      name: "Astra",
      catalogDisplayName: "GPT-6-Astra",
      catalogDisplayNames: ["GPT-6-Astra", "GPT-6 Astra"],
      dots: [1, 2, 3, 4, 5, 6],
      colors: ["#E3F8F8", "#C6ECEC"],
      textColors: ["#bfe7e7", "#a9d9d9"],
      supportsFast: true,
    },
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

  /* COPICKER_BEHAVIOR_CONTRACT_BEGIN */
  function modelListSelectionKind(options, explicit) {
    if (!Array.isArray(options) || options.length < 2 ||
        ![true, false].includes(explicit)) return null;
    if (options[0].model !== null || options[0].markedSelected) return null;
    const models = options.slice(1).map((option) => option.model);
    if (models.some((model) => typeof model !== "string" || !model) ||
        new Set(models).size !== models.length) return null;
    const selected = options.flatMap((option, index) => option.selected ? [index] : []);
    if (selected.length !== 1) return null;
    const index = selected[0];
    if (index === 0) return explicit ? null : "default";
    if (!explicit || !options[index].markedSelected || options[index].locked) return null;
    return "model";
  }

  function isValidThreadID(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      String(value || ""),
    );
  }

  function exactValidThreadID(values) {
    const threadIDs = [...new Set(values.filter(isValidThreadID))];
    return threadIDs.length === 1 ? threadIDs[0] : null;
  }

  function pointerReleaseAction(
    startedOnThumb,
    movedDuringGesture,
    startX,
    startY,
    endX,
    endY,
    threshold,
  ) {
    const movedAtRelease =
      Math.hypot(endX - startX, endY - startY) > threshold;
    return startedOnThumb && !movedDuringGesture && !movedAtRelease
      ? "toggle-fast"
      : "select";
  }

  function pointerPreviewFastMode(startFastMode, targetSupportsFast) {
    return Boolean(startFastMode && targetSupportsFast);
  }

  function normalizedDisplayName(value) {
    return String(value || "")
      .toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, "");
  }

  function officialExactLabelMatch(textValues, labelValues) {
    const labels = new Set(
      (Array.isArray(labelValues) ? labelValues : [])
        .map(normalizedDisplayName)
        .filter(Boolean),
    );
    return labels.size > 0 &&
      (Array.isArray(textValues) ? textValues : []).some(
        (value) => labels.has(normalizedDisplayName(value)),
      );
  }

  function officialAdvancedLayout(
    itemCount,
    modelIndex,
    selectedEffortIndices,
    submenuIndices,
    expectedEffortCount,
    expectedSelectedEffortIndex,
  ) {
    if (!Number.isInteger(itemCount) || itemCount < 1) return null;
    const validIndices = (values) => [...new Set(
      (Array.isArray(values) ? values : []).filter(
        (value) => Number.isInteger(value) && value >= 0 && value < itemCount,
      ),
    )].sort((left, right) => left - right);
    const selected = validIndices(selectedEffortIndices);
    const submenus = validIndices(submenuIndices);

    if (Number.isInteger(modelIndex) && modelIndex >= 0 && modelIndex < itemCount) {
      if (
        Number.isInteger(expectedEffortCount) &&
        expectedEffortCount > 0 &&
        Number.isInteger(expectedSelectedEffortIndex) &&
        expectedSelectedEffortIndex >= 0 &&
        expectedSelectedEffortIndex < expectedEffortCount &&
        modelIndex === expectedEffortCount &&
        itemCount === modelIndex + 2 &&
        selected.length === 1 &&
        selected[0] === expectedSelectedEffortIndex &&
        submenus.length === 2 &&
        submenus[0] === modelIndex &&
        submenus[1] === modelIndex + 1
      ) {
        return {
          kind: "flat-effort",
          modelIndex,
          effortIndices: Array.from(
            { length: expectedEffortCount },
            (_, index) => index,
          ),
          speedIndex: submenus[1],
        };
      }

      if (
        itemCount === 3 &&
        modelIndex === 0 &&
        selected.length === 0 &&
        submenus.length === 3 &&
        submenus.every((index, position) => index === position)
      ) {
        return {
          kind: "submenu-effort",
          modelIndex,
          effortIndex: submenus[1],
          speedIndex: submenus[2],
        };
      }
      return null;
    }

    if (
      modelIndex === -1 &&
      itemCount === 3 &&
      selected.length === 0 &&
      submenus.length === 3 &&
      submenus.every((index, position) => index === position)
    ) {
      return {
        kind: "power-submenus",
        modelIndex: submenus[0],
        effortIndex: submenus[1],
        speedIndex: submenus[2],
      };
    }
    return null;
  }

  function officialSpeedConfirmationSource(
    enabled,
    compactState,
    selectedLeafIndex,
    targetIndex,
  ) {
    if (enabled && compactState === true) return "checkbox";
    if (
      Number.isInteger(selectedLeafIndex) &&
      Number.isInteger(targetIndex) &&
      selectedLeafIndex === targetIndex
    ) {
      return "selected-leaf";
    }
    return null;
  }

  function officialServiceTierTransitionPlan(
    targetIndex,
    selectedIndex,
    optionCount,
    preferredNonStandardIndex,
  ) {
    if (
      !Number.isInteger(targetIndex) ||
      !Number.isInteger(selectedIndex) ||
      !Number.isInteger(optionCount) ||
      optionCount < 1 ||
      targetIndex < 0 ||
      targetIndex >= optionCount ||
      selectedIndex < 0 ||
      selectedIndex >= optionCount
    ) {
      return null;
    }
    if (targetIndex !== 0 || selectedIndex !== 0) return [targetIndex];
    if (
      optionCount < 2 ||
      !Number.isInteger(preferredNonStandardIndex) ||
      preferredNonStandardIndex <= 0 ||
      preferredNonStandardIndex >= optionCount
    ) {
      return null;
    }
    return [preferredNonStandardIndex, 0];
  }

  function officialServiceTierFastState(serviceTier, fastTierID) {
    if (serviceTier === null || serviceTier === "default") return false;
    if (fastTierID && serviceTier === fastTierID) return true;
    return null;
  }

  function selectionIntentIdentityMatches(
    expectedThreadID,
    currentThreadID,
    sameComposerRoot,
    hasOpenTrigger,
    expectedInteractionEpoch,
    currentInteractionEpoch,
  ) {
    return Boolean(hasOpenTrigger) &&
      Boolean(sameComposerRoot) &&
      (expectedThreadID || null) === (currentThreadID || null) &&
      expectedInteractionEpoch === currentInteractionEpoch;
  }

  function shouldCommitUnchangedPointerSelection(
    supersededKeyboardCommit,
    hasCurrentThread,
  ) {
    return Boolean(supersededKeyboardCommit) || !hasCurrentThread;
  }

  function shouldVerifyUnchangedNoTaskSelection(
    sameAsConfirmed,
    force,
    fastMode,
  ) {
    return Boolean(sameAsConfirmed && !force && fastMode);
  }

  function shouldReuseThreadSelectionConfirmation(
    sameAsConfirmed,
    force,
    daybreakProgramPresent,
    daybreakProgramChecked,
  ) {
    return Boolean(
      sameAsConfirmed &&
      !force &&
      daybreakProgramPresent &&
      daybreakProgramChecked === false
    );
  }

  function daybreakProgramAllowsBaseConfirmation(
    present,
    checked,
    legacyModelProven,
  ) {
    return (present && checked === false) ||
      (!present && Boolean(legacyModelProven));
  }

  function shouldRecordDaybreakStructureChange(changed, proxyReadDepth) {
    return Boolean(changed && proxyReadDepth === 0);
  }

  function shouldPreserveConfirmedNoThreadSelection(
    resolvedThreadID,
    currentThreadID,
    sameComposerRoot,
    confirmedThreadID,
    hasConfirmedSelection,
    officialSelectionDirty,
    commitInFlight,
  ) {
    return Boolean(
      !resolvedThreadID &&
      !currentThreadID &&
      sameComposerRoot &&
      confirmedThreadID === null &&
      hasConfirmedSelection &&
      (!officialSelectionDirty || commitInFlight)
    );
  }
  /* COPICKER_BEHAVIOR_CONTRACT_END */

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
  const SETTINGS_HTML = typeof window.__COPICKER_SETTINGS_HTML__ === "string"
    ? window.__COPICKER_SETTINGS_HTML__
    : "";
  delete window.__COPICKER_CONFIG__;
  delete window.__COPICKER_SETTINGS_HTML__;
  const CONFIG_SIGNATURE = JSON.stringify(CONFIG);
  installSettingsIntegration(SETTINGS_HTML);

  function installSettingsIntegration(settingsHTML) {
    if (window.top !== window.self || settingsHTML.length === 0) return null;

    const existing = window[SETTINGS_GLOBAL_KEY];
    if (existing?.version === VERSION && existing?.settingsHTML === settingsHTML) {
      existing.sync?.();
      return existing;
    }
    existing?.dispose?.();

    const fallbackDocument = new DOMParser().parseFromString(settingsHTML, "text/html");
    fallbackDocument.querySelectorAll("script").forEach((script) => script.remove());
    fallbackDocument.documentElement.dataset.copickerSettingsController = "parent";

    const integration = {
      version: VERSION,
      settingsHTML,
      fallbackHTML: `<!doctype html>\n${fallbackDocument.documentElement.outerHTML}`,
      observer: null,
      themeObserver: null,
      scheduled: false,
      active: false,
      button: null,
      host: null,
      frame: null,
      frameController: null,
      currentThreadID: null,
      pendingRequests: new Map(),
      suppressedButtons: new Map(),
      disposed: false,
    };

    function validThreadID(value) {
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        String(value || ""),
      );
    }

    function rememberVisibleThreadID() {
      for (const marker of document.querySelectorAll(CONVERSATION_CONTEXT_SELECTOR)) {
        const threadID = marker.getAttribute("data-above-composer-conversation-id");
        if (validThreadID(threadID)) {
          integration.currentThreadID = threadID;
          return threadID;
        }
      }
      return integration.currentThreadID;
    }

    function makeSettingsRequestID() {
      if (typeof crypto?.randomUUID === "function") {
        return `copicker-settings-${crypto.randomUUID()}`;
      }
      return `copicker-settings-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    function sendSettingsAppServerRequest(
      method,
      params,
      timeoutMs = APP_SERVER_REQUEST_TIMEOUT_MS,
    ) {
      const allowedMethods = new Set(["thread/loaded/list", "mcpServer/tool/call"]);
      if (!allowedMethods.has(method)) {
        return Promise.reject(new Error("CoPicker rejected an unsupported settings method."));
      }

      const bridge = window.electronBridge;
      if (typeof bridge?.sendMessageFromView !== "function") {
        return Promise.reject(new Error("Codex renderer bridge is unavailable."));
      }

      const id = makeSettingsRequestID();
      return new Promise((resolve, reject) => {
        const timeoutID = window.setTimeout(() => {
          integration.pendingRequests.delete(id);
          reject(new Error(`${method} timed out.`));
        }, timeoutMs);
        integration.pendingRequests.set(id, { method, resolve, reject, timeoutID });

        try {
          bridge.sendMessageFromView({
            type: "mcp-request",
            hostId: APP_SERVER_HOST_ID,
            request: { id, method, params },
            priority: "background",
            source: "mcp",
            timeoutMs,
            expiresAtMs: Date.now() + timeoutMs,
          });
        } catch (error) {
          window.clearTimeout(timeoutID);
          integration.pendingRequests.delete(id);
          reject(error);
        }
      });
    }

    async function resolveSettingsThreadID() {
      const remembered = rememberVisibleThreadID();
      if (validThreadID(remembered)) return remembered;

      const loaded = await sendSettingsAppServerRequest("thread/loaded/list", {
        cursor: null,
        limit: 100,
      });
      const threadID = Array.isArray(loaded?.data)
        ? loaded.data.find(validThreadID) || null
        : null;
      if (!threadID) {
        throw new Error("Open a Codex task before changing CoPicker settings.");
      }
      integration.currentThreadID = threadID;
      return threadID;
    }

    async function callSettingsTool(name, args) {
      if (
        name !== SETTINGS_READ_TOOL && name !== SETTINGS_SAVE_TOOL &&
        name !== SETTINGS_APPLY_TOOL
      ) {
        throw new Error("Unsupported CoPicker settings tool.");
      }
      const threadID = await resolveSettingsThreadID();
      return sendSettingsAppServerRequest(
        "mcpServer/tool/call",
        {
          threadId: threadID,
          server: SETTINGS_SERVER_NAME,
          tool: name,
          arguments: args && typeof args === "object" ? args : {},
        },
        name === SETTINGS_APPLY_TOOL
          ? SETTINGS_APPLY_REQUEST_TIMEOUT_MS
          : APP_SERVER_REQUEST_TIMEOUT_MS,
      );
    }

    function settingsSnapshotCandidate(value) {
      const candidates = [
        value?.structuredContent,
        value?.result?.structuredContent,
        value?.toolOutput?.structuredContent,
        value?.data,
        value,
      ];
      return candidates.find(
        (candidate) => candidate && typeof candidate === "object",
      ) || null;
    }

    function normalizedSettingsSnapshot(value) {
      const candidate = settingsSnapshotCandidate(value);
      if (!candidate) return null;
      const modelIDs = ALL_ROWS.map((row) => row.id);
      const visibleModels = Array.isArray(candidate.visibleModels)
        ? modelIDs.filter((id) => candidate.visibleModels.includes(id))
        : [];
      if (
        !Number.isInteger(candidate.schemaVersion) ||
        !Number.isInteger(candidate.revision) ||
        typeof candidate.enabled !== "boolean" ||
        visibleModels.length === 0 ||
        !["top", "left", "right"].includes(candidate.preferredPlacement) ||
        !["codex", "system", "light", "dark"].includes(candidate.appearance)
      ) {
        return null;
      }
      return {
        schemaVersion: candidate.schemaVersion,
        revision: candidate.revision,
        enabled: candidate.enabled,
        visibleModels,
        preferredPlacement: candidate.preferredPlacement,
        appearance: candidate.appearance,
      };
    }

    function normalizedSettingsApplyResult(value) {
      const candidate = settingsSnapshotCandidate(value);
      return candidate?.applied === true &&
        candidate?.applyMode === "current-process"
        ? candidate
        : null;
    }

    function settingsToolFailure(value) {
      const candidates = [value, value?.result, value?.toolOutput];
      const failed = candidates.find((candidate) => candidate?.isError === true);
      if (!failed) return null;
      const message = Array.isArray(failed.content)
        ? failed.content.find(
            (item) => item?.type === "text" && typeof item.text === "string",
          )?.text
        : null;
      const error = new Error(message || "CoPicker settings request failed.");
      error.code = failed._meta?.["copicker/errorCode"] ?? -32000;
      error.data = normalizedSettingsSnapshot(failed);
      return error;
    }

    function sameSettingsPreferences(left, right) {
      return Boolean(left && right) &&
        left.enabled === right.enabled &&
        left.preferredPlacement === right.preferredPlacement &&
        left.appearance === right.appearance &&
        left.visibleModels.length === right.visibleModels.length &&
        left.visibleModels.every(
          (model, index) => model === right.visibleModels[index],
        );
    }

    function installSettingsFrameController(frame) {
      const frameDocument = frame.contentDocument;
      const main = frameDocument?.querySelector("main");
      const saveState = frameDocument?.querySelector("#save-state");
      const errorPanel = frameDocument?.querySelector("#error-panel");
      const errorMessage = frameDocument?.querySelector("#error-message");
      const retryButton = frameDocument?.querySelector("#retry");
      const applyButton = frameDocument?.querySelector("#apply-now");
      const applyResult = frameDocument?.querySelector("#apply-result");
      const enabledInput = frameDocument?.querySelector("#enabled");
      const modelInputs = [
        ...(frameDocument?.querySelectorAll('input[name="visible-model"]') || []),
      ];
      const placementInputs = [
        ...(frameDocument?.querySelectorAll('input[name="placement"]') || []),
      ];
      const appearanceInputs = [
        ...(frameDocument?.querySelectorAll('input[name="appearance"]') || []),
      ];
      if (
        !main || !saveState || !errorPanel || !errorMessage || !retryButton ||
        !applyButton || !applyResult ||
        !enabledInput || modelInputs.length === 0 || placementInputs.length === 0 ||
        appearanceInputs.length === 0
      ) {
        return null;
      }

      const allInputs = [
        enabledInput,
        ...modelInputs,
        ...placementInputs,
        ...appearanceInputs,
      ];
      const listeners = [];
      let authoritative = null;
      let draft = null;
      let saving = false;
      let applying = false;
      let retryApply = false;
      let blockedByConflict = false;
      let disposed = false;

      function listen(target, type, handler) {
        target.addEventListener(type, handler);
        listeners.push(() => target.removeEventListener(type, handler));
      }

      function setStatus(message, tone = "normal") {
        if (disposed) return;
        saveState.textContent = message;
        saveState.dataset.tone = tone;
      }

      function showError(message, retryLabel = "重新读取", applyRetry = false) {
        if (disposed) return;
        errorMessage.textContent = message;
        retryButton.textContent = retryLabel;
        retryApply = applyRetry;
        errorPanel.dataset.visible = "true";
      }

      function clearError() {
        if (disposed) return;
        errorPanel.dataset.visible = "false";
        errorMessage.textContent = "";
        retryApply = false;
      }

      function setApplyResult(message = "", tone = "normal") {
        if (disposed) return;
        applyResult.textContent = message;
        applyResult.dataset.tone = tone;
      }

      function updateApplyAvailability() {
        if (disposed) return;
        const ready = Boolean(authoritative && draft) &&
          sameSettingsPreferences(authoritative, draft) &&
          !saving && !applying && !blockedByConflict &&
          main.dataset.loading !== "true";
        applyButton.disabled = !ready;
        applyButton.textContent = applying ? "正在应用…" : "立即应用";
      }

      function setLoading(loading) {
        if (disposed) return;
        main.dataset.loading = String(loading);
        main.setAttribute("aria-busy", String(loading));
        allInputs.forEach((input) => {
          input.disabled = loading;
        });
        updateApplyAvailability();
      }

      function readForm() {
        return {
          schemaVersion: authoritative?.schemaVersion || 1,
          revision: authoritative?.revision || 0,
          enabled: enabledInput.checked,
          visibleModels: ALL_ROWS.map((row) => row.id).filter((id) =>
            modelInputs.some((input) => input.value === id && input.checked)
          ),
          preferredPlacement:
            placementInputs.find((input) => input.checked)?.value || "top",
          appearance:
            appearanceInputs.find((input) => input.checked)?.value || "dark",
        };
      }

      function writeForm(snapshot) {
        if (disposed) return;
        enabledInput.checked = snapshot.enabled;
        modelInputs.forEach((input) => {
          input.checked = snapshot.visibleModels.includes(input.value);
        });
        placementInputs.forEach((input) => {
          input.checked = input.value === snapshot.preferredPlacement;
        });
        appearanceInputs.forEach((input) => {
          input.checked = input.value === snapshot.appearance;
        });
      }

      function saveArguments(snapshot) {
        return {
          expectedRevision: authoritative.revision,
          enabled: snapshot.enabled,
          visibleModels: snapshot.visibleModels,
          preferredPlacement: snapshot.preferredPlacement,
          appearance: snapshot.appearance,
        };
      }

      async function flushSaveQueue() {
        if (
          disposed || saving || blockedByConflict || !authoritative || !draft
        ) {
          return;
        }
        saving = true;
        updateApplyAvailability();
        clearError();
        try {
          while (!disposed && !sameSettingsPreferences(authoritative, draft)) {
            const requested = {
              ...draft,
              visibleModels: [...draft.visibleModels],
            };
            setStatus("正在保存…");
            const result = await callSettingsTool(
              SETTINGS_SAVE_TOOL,
              saveArguments(requested),
            );
            if (disposed) return;
            const failure = settingsToolFailure(result);
            if (failure) throw failure;
            const saved = normalizedSettingsSnapshot(result);
            if (!saved) throw new Error("保存响应缺少有效设置快照。");
            authoritative = saved;
            if (sameSettingsPreferences(requested, draft)) draft = saved;
          }
          setStatus("已保存 · 下次注入生效");
        } catch (error) {
          if (disposed) return;
          const current = normalizedSettingsSnapshot(error?.data);
          if (error?.code === -32009 && current) {
            authoritative = current;
            draft = current;
            blockedByConflict = true;
            writeForm(current);
            setStatus("发现更新冲突", "error");
            showError(
              "设置已在另一个窗口中修改，已显示最新版本。请确认后再修改。",
              "继续编辑",
            );
          } else {
            setStatus("保存失败", "error");
            showError(error?.message || "设置无法保存。", "重试保存");
          }
        } finally {
          saving = false;
          updateApplyAvailability();
        }
      }

      function onPreferenceChange(event) {
        if (disposed || !authoritative || blockedByConflict) return;
        const nextDraft = readForm();
        if (nextDraft.visibleModels.length === 0) {
          event.target.checked = true;
          setStatus("至少保留一个模型", "error");
          showError("模型选择器至少需要保留一个已适配模型。", "知道了");
          return;
        }
        draft = nextDraft;
        setApplyResult();
        updateApplyAvailability();
        void flushSaveQueue();
      }

      async function applySettingsNow() {
        if (
          disposed || applying || saving || blockedByConflict ||
          !authoritative || !draft ||
          !sameSettingsPreferences(authoritative, draft)
        ) {
          return;
        }
        applying = true;
        updateApplyAvailability();
        clearError();
        setApplyResult();
        setStatus("正在应用到当前 Codex…");
        try {
          const result = await callSettingsTool(SETTINGS_APPLY_TOOL, {});
          if (disposed) return;
          const failure = settingsToolFailure(result);
          if (failure) throw failure;
          if (!normalizedSettingsApplyResult(result)) {
            throw new Error("应用响应缺少有效结果。");
          }
          setStatus("已应用到当前 Codex");
          setApplyResult("当前窗口已更新，无需重启。", "success");
        } catch (error) {
          if (disposed) return;
          setStatus("立即应用失败", "error");
          setApplyResult(
            "未立即应用；已保存设置仍会在下次启动时生效。",
            "error",
          );
          showError(
            error?.message || "无法应用到当前 Codex。",
            "重试应用",
            true,
          );
        } finally {
          applying = false;
          updateApplyAvailability();
        }
      }

      async function loadSettings() {
        setLoading(true);
        clearError();
        setStatus("正在读取设置…");
        try {
          const result = await callSettingsTool(SETTINGS_READ_TOOL, {});
          if (disposed) return;
          const failure = settingsToolFailure(result);
          if (failure) throw failure;
          const loaded = normalizedSettingsSnapshot(result);
          if (!loaded) throw new Error("读取响应缺少有效设置快照。");
          authoritative = loaded;
          draft = loaded;
          blockedByConflict = false;
          writeForm(loaded);
          setStatus("已保存 · 下次注入生效");
        } catch (error) {
          if (disposed) return;
          setStatus("无法读取设置", "error");
          showError(error?.message || "CoPicker 设置服务不可用。", "重新读取");
        } finally {
          setLoading(false);
        }
      }

      function onRetry() {
        if (retryApply) {
          clearError();
          void applySettingsNow();
          return;
        }
        if (blockedByConflict) {
          blockedByConflict = false;
          clearError();
          setStatus("已保存 · 下次注入生效");
          updateApplyAvailability();
          return;
        }
        if (
          authoritative && draft &&
          !sameSettingsPreferences(authoritative, draft)
        ) {
          clearError();
          void flushSaveQueue();
          return;
        }
        void loadSettings();
      }

      allInputs.forEach((input) => listen(input, "change", onPreferenceChange));
      listen(applyButton, "click", () => {
        void applySettingsNow();
      });
      listen(retryButton, "click", onRetry);
      void loadSettings();

      return {
        dispose() {
          if (disposed) return;
          disposed = true;
          listeners.splice(0).forEach((removeListener) => removeListener());
        },
      };
    }

    function handleSettingsMessage(event) {
      const envelope = event.data;
      if (
        envelope?.hostId === APP_SERVER_HOST_ID &&
        envelope?.type === "mcp-response"
      ) {
        const response = envelope.message;
        const pending = integration.pendingRequests.get(response?.id);
        if (!pending) return;
        event.stopImmediatePropagation();
        window.clearTimeout(pending.timeoutID);
        integration.pendingRequests.delete(response.id);
        if (response.error) {
          const error = new Error(response.error.message || `${pending.method} failed.`);
          error.code = response.error.code;
          error.data = response.error.data;
          pending.reject(error);
        } else {
          pending.resolve(response.result);
        }
        return;
      }
    }

    function systemSettingsAppearance() {
      return window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    }

    function settingsAppearance() {
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
      if (colorScheme === "light" || colorScheme === "dark") return colorScheme;
      return systemSettingsAppearance();
    }

    function firstSettingsStyleValue(style, names) {
      for (const name of names) {
        const value = style.getPropertyValue(name).trim();
        if (value.length > 0) return value;
      }
      return "";
    }

    function syncSettingsFrameStyleVariables(frameRoot, hostStyle) {
      if (!frameRoot) return;
      for (const [target, sources] of SETTINGS_FRAME_STYLE_VARIABLES) {
        const value = firstSettingsStyleValue(hostStyle, sources);
        if (value.length > 0) {
          frameRoot.style.setProperty(target, value);
        } else {
          frameRoot.style.removeProperty(target);
        }
      }
    }

    function updateSettingsAppearance() {
      if (!integration.host) return;
      const appearance = settingsAppearance();
      const hostStyle = getComputedStyle(document.documentElement);
      integration.host.setAttribute("data-appearance-resolved", appearance);
      integration.host.style.colorScheme = appearance;
      integration.host.style.background = firstSettingsStyleValue(hostStyle, [
        "--color-background-surface",
        "--color-surface-tertiary",
        "--color-surface",
      ]) || (
        appearance === "light" ? "rgb(255, 255, 255)" : "rgb(30, 30, 30)"
      );
      const frameRoot = integration.frame?.contentDocument?.documentElement;
      if (frameRoot) {
        frameRoot.style.colorScheme = appearance;
        syncSettingsFrameStyleVariables(frameRoot, hostStyle);
      }
      integration.frame?.contentWindow?.postMessage({
        method: "copicker/theme",
        params: { appearance },
      }, "*");
    }

    function settingsAnchor() {
      return document.querySelector(
        'button[data-settings-panel-slug="browser-use"]',
      ) || document.querySelector(
        'button[data-settings-panel-slug="plugins-settings"]',
      );
    }

    function nativeSettingsButton(anchor) {
      const scope = anchor?.parentElement;
      if (!scope) return null;
      return [...scope.querySelectorAll('button[aria-label="CoPicker"]')].find(
        (button) => button.id !== SETTINGS_BUTTON_ID,
      ) || null;
    }

    function makeSettingsIcon() {
      const namespace = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(namespace, "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("fill", "none");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("class", "icon-sm shrink-0");
      const outline = document.createElementNS(namespace, "rect");
      outline.setAttribute("x", "2.25");
      outline.setAttribute("y", "2.25");
      outline.setAttribute("width", "19.5");
      outline.setAttribute("height", "19.5");
      outline.setAttribute("rx", "4.25");
      outline.setAttribute("stroke", "currentColor");
      outline.setAttribute("stroke-width", "2");
      outline.setAttribute("stroke-linejoin", "round");
      svg.append(outline);
      for (const y of [7, 12, 17]) {
        for (const x of [7, 12, 17]) {
          const dot = document.createElementNS(namespace, "circle");
          dot.setAttribute("cx", String(x));
          dot.setAttribute("cy", String(y));
          dot.setAttribute("r", "1.15");
          dot.setAttribute("fill", "currentColor");
          svg.append(dot);
        }
      }
      return svg;
    }

    function createSettingsButton(anchor) {
      const button = anchor.cloneNode(true);
      button.id = SETTINGS_BUTTON_ID;
      button.setAttribute("type", "button");
      button.setAttribute("aria-label", "CoPicker");
      button.setAttribute("data-settings-panel-slug", "copicker");
      button.removeAttribute("disabled");
      button.removeAttribute("aria-current");
      const oldIcon = button.querySelector("svg, img");
      oldIcon?.replaceWith(makeSettingsIcon());
      const labels = [...button.querySelectorAll("span")].filter(
        (element) => element.children.length === 0,
      );
      const label = labels.at(-1);
      if (label) {
        label.textContent = "CoPicker";
      } else {
        const fallbackLabel = document.createElement("span");
        fallbackLabel.className = "truncate";
        fallbackLabel.textContent = "CoPicker";
        button.append(fallbackLabel);
      }
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        showSettingsPanel();
      });
      anchor.insertAdjacentElement("afterend", button);
      integration.button = button;
      return button;
    }

    function restoreNativeButtons() {
      for (const [button, previous] of integration.suppressedButtons) {
        if (!button.isConnected) continue;
        if (previous.value.length > 0) {
          button.style.setProperty("background-color", previous.value, previous.priority);
        } else {
          button.style.removeProperty("background-color");
        }
      }
      integration.suppressedButtons.clear();
    }

    function updateSettingsButtonState() {
      const button = integration.button;
      if (!button) return;
      button.classList.toggle("bg-primary-ghost-hover", integration.active);
      if (integration.active) {
        button.setAttribute("aria-current", "page");
        const scope = button.parentElement;
        for (const nativeButton of scope?.querySelectorAll(
          "button[data-settings-panel-slug]",
        ) || []) {
          if (nativeButton === button || integration.suppressedButtons.has(nativeButton)) {
            continue;
          }
          integration.suppressedButtons.set(nativeButton, {
            value: nativeButton.style.getPropertyValue("background-color"),
            priority: nativeButton.style.getPropertyPriority("background-color"),
          });
          nativeButton.style.setProperty("background-color", "transparent", "important");
        }
      } else {
        button.removeAttribute("aria-current");
        restoreNativeButtons();
      }
    }

    function nativeSettingsScrollViewport(container) {
      if (!(container instanceof HTMLElement)) return null;
      const containerRect = container.getBoundingClientRect();
      return [container, ...container.querySelectorAll("*")]
        .filter((element) => element instanceof HTMLElement)
        .map((element) => ({
          element,
          rect: element.getBoundingClientRect(),
          overflowY: getComputedStyle(element).overflowY,
        }))
        .filter(({ rect, overflowY }) =>
          (overflowY === "auto" || overflowY === "scroll") &&
          rect.width >= containerRect.width * 0.85 &&
          rect.height > 120 &&
          rect.top >= containerRect.top &&
          rect.bottom <= containerRect.bottom,
        )
        .sort((left, right) =>
          right.rect.width * right.rect.height - left.rect.width * left.rect.height,
        )[0]?.rect || null;
    }

    function settingsContentRect(anchor) {
      let child = anchor;
      while (child?.parentElement && child.parentElement !== document.body) {
        const parent = child.parentElement;
        const parentRect = parent.getBoundingClientRect();
        if (parentRect.width >= window.innerWidth * 0.62) {
          const sibling = [...parent.children]
            .filter((element) => element !== child && element instanceof HTMLElement)
            .map((element) => ({ element, rect: element.getBoundingClientRect() }))
            .filter(({ rect }) => rect.width >= window.innerWidth * 0.38 && rect.height > 120)
            .sort((left, right) => right.rect.width - left.rect.width)[0];
          if (sibling) {
            return nativeSettingsScrollViewport(sibling.element) || sibling.rect;
          }
        }
        child = parent;
      }

      const anchorRect = anchor.getBoundingClientRect();
      let sidebarRect = anchorRect;
      for (let element = anchor.parentElement; element; element = element.parentElement) {
        const rect = element.getBoundingClientRect();
        if (
          rect.width >= anchorRect.width &&
          rect.width <= Math.min(440, window.innerWidth * 0.48) &&
          rect.height >= window.innerHeight * 0.62
        ) {
          sidebarRect = rect;
        }
      }
      const left = Math.max(sidebarRect.right, anchorRect.right + 8);
      return {
        left,
        top: Math.max(0, sidebarRect.top),
        right: window.innerWidth,
        bottom: Math.min(window.innerHeight, sidebarRect.bottom || window.innerHeight),
        width: Math.max(0, window.innerWidth - left),
        height: Math.max(0, Math.min(window.innerHeight, sidebarRect.bottom) - sidebarRect.top),
      };
    }

    function positionSettingsPanel() {
      const anchor = settingsAnchor();
      const host = integration.host;
      if (!anchor || !host) return;
      const rect = settingsContentRect(anchor);
      const values = {
        left: `${Math.round(rect.left)}px`,
        top: `${Math.round(rect.top)}px`,
        width: `${Math.round(rect.width)}px`,
        height: `${Math.round(rect.height)}px`,
      };
      for (const [property, value] of Object.entries(values)) {
        if (host.style[property] !== value) host.style[property] = value;
      }
    }

    function ensureSettingsPanel() {
      if (integration.host?.isConnected) return integration.host;
      const host = document.createElement("section");
      host.id = SETTINGS_HOST_ID;
      host.setAttribute("aria-label", "CoPicker settings");
      host.style.position = "fixed";
      host.style.zIndex = "2147483000";
      host.style.overflow = "hidden";
      host.style.border = "0";

      const frame = document.createElement("iframe");
      frame.title = "CoPicker settings";
      frame.setAttribute("sandbox", "allow-same-origin");
      frame.style.display = "block";
      frame.style.width = "100%";
      frame.style.height = "100%";
      frame.style.border = "0";
      frame.style.background = "transparent";
      frame.srcdoc = integration.fallbackHTML;
      frame.addEventListener("load", () => {
        updateSettingsAppearance();
        integration.frameController?.dispose?.();
        integration.frameController = installSettingsFrameController(frame);
      });
      host.append(frame);
      document.body.append(host);
      integration.host = host;
      integration.frame = frame;
      updateSettingsAppearance();
      return host;
    }

    function showSettingsPanel() {
      integration.active = true;
      updateSettingsButtonState();
      ensureSettingsPanel();
      positionSettingsPanel();
    }

    function hideSettingsPanel({ removeButton = false } = {}) {
      integration.active = false;
      updateSettingsButtonState();
      integration.frameController?.dispose?.();
      integration.frameController = null;
      integration.host?.remove();
      integration.host = null;
      integration.frame = null;
      if (removeButton) {
        integration.button?.remove();
        integration.button = null;
      }
    }

    function syncSettingsNow() {
      integration.scheduled = false;
      rememberVisibleThreadID();
      if (integration.button && !integration.button.isConnected) {
        integration.button = null;
      }

      const anchor = settingsAnchor();
      if (!anchor) {
        hideSettingsPanel({ removeButton: true });
        return;
      }
      if (nativeSettingsButton(anchor)) {
        hideSettingsPanel({ removeButton: true });
        return;
      }
      if (!integration.button) createSettingsButton(anchor);
      if (integration.active) {
        updateSettingsButtonState();
        ensureSettingsPanel();
        positionSettingsPanel();
      }
    }

    function scheduleSettingsSync() {
      if (integration.scheduled || integration.disposed) return;
      integration.scheduled = true;
      requestAnimationFrame(syncSettingsNow);
    }

    function handleSettingsNavigation(event) {
      if (!integration.active || !(event.target instanceof Element)) return;
      const clickedButton = event.target.closest("button");
      if (!clickedButton || clickedButton === integration.button) return;
      if (
        clickedButton.hasAttribute("data-settings-panel-slug") ||
        integration.button?.parentElement?.contains(clickedButton)
      ) {
        hideSettingsPanel();
      }
    }

    function handleSettingsKeyDown(event) {
      if (!integration.active || event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      hideSettingsPanel();
      integration.button?.focus();
    }

    integration.sync = scheduleSettingsSync;
    integration.dispose = () => {
      integration.disposed = true;
      integration.observer?.disconnect();
      integration.themeObserver?.disconnect();
      window.removeEventListener("message", handleSettingsMessage, true);
      window.removeEventListener("resize", scheduleSettingsSync);
      document.removeEventListener("click", handleSettingsNavigation, true);
      document.removeEventListener("keydown", handleSettingsKeyDown, true);
      for (const pending of integration.pendingRequests.values()) {
        window.clearTimeout(pending.timeoutID);
        pending.reject(new Error("CoPicker settings integration was disposed."));
      }
      integration.pendingRequests.clear();
      hideSettingsPanel({ removeButton: true });
      if (window[SETTINGS_GLOBAL_KEY] === integration) {
        delete window[SETTINGS_GLOBAL_KEY];
      }
    };

    integration.observer = new MutationObserver(scheduleSettingsSync);
    integration.observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
    });
    integration.themeObserver = new MutationObserver(updateSettingsAppearance);
    integration.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme", "data-color-scheme"],
    });
    window.addEventListener("message", handleSettingsMessage, true);
    window.addEventListener("resize", scheduleSettingsSync);
    document.addEventListener("click", handleSettingsNavigation, true);
    document.addEventListener("keydown", handleSettingsKeyDown, true);
    window[SETTINGS_GLOBAL_KEY] = integration;
    scheduleSettingsSync();
    return integration;
  }
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
      noThreadSwitchMode: "official-control-proxy",
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
      noThreadSwitchMode: "official-control-proxy",
      design: "preview-2d",
      version: VERSION,
    };
  }
  if (previous) previous.dismissedForCurrentOpen = true;
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
    defaultSelection: false,
    modelListKeyboardDispatch: false,
    fastMode: false,
    selectionRevision: 0,
    railSelectionGeneration: 0,
    confirmedSelection: null,
    confirmedThreadID: null,
    officialInteractionEpoch: 0,
    officialSelectionMutationGeneration: 0,
    officialStructureMutationGeneration: 0,
    officialDaybreakProgramMutationGeneration: 0,
    officialProxyReadDepth: 0,
    officialSelectionDirty: false,
    commitTimer: null,
    pendingKeyboardBaseline: null,
    commitQueue: Promise.resolve(),
    commitInFlight: false,
    commitThreadID: null,
    pendingRequests: new Map(),
    settingsWaiters: new Set(),
    settingsNotificationGeneration: 0,
    latestThreadSettings: new Map(),
    daybreakClassification: null,
    officialModelCatalog: null,
    modelCatalog: null,
    modelCatalogPromise: null,
    threadClassificationPromise: null,
    threadClassificationKey: null,
    trustedSelectionAction: null,
    trustedSelectionActionTimer: null,
    currentThreadID: null,
    pendingOfficialSelection: null,
    switchState: "idle",
    lastSwitchError: null,
    handleBridgeMessage: null,
    handleOfficialInteraction: null,
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
    const hasReasoningSlider = Boolean(
      surface.querySelector(REASONING_SLIDER_SELECTOR),
    );
    return (
      surface.matches(SECONDARY_SURFACE_SELECTOR) ||
      Boolean(surface.closest(SECONDARY_SURFACE_SELECTOR)) ||
      (!hasReasoningSlider && (
        Boolean(surface.querySelector(SECONDARY_ITEM_SELECTOR)) ||
        Boolean(surface.querySelector(MODEL_ROW_SELECTOR))
      ))
    );
  }

  function surfaceOwnsSelector(surface, selector) {
    if (!surface) return false;
    return [...surface.querySelectorAll(selector)].some(
      (element) => element.closest(PRIMARY_SURFACE_SELECTOR) === surface,
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
    const ownsReasoningSlider = [...surface.querySelectorAll(
      REASONING_SLIDER_SELECTOR,
    )].some(
      (slider) => slider.closest(PRIMARY_SURFACE_SELECTOR) === surface,
    );
    return (
      isVisible(surface) &&
      !surface.closest("[aria-hidden='true'], [inert]") &&
      !isSecondarySurface(surface) &&
      ownsReasoningSlider &&
      (
        surfaceOwnsSelector(surface, PRIMARY_CONTROL_SELECTOR) ||
        surfaceOwnsSelector(surface, MODEL_ROW_SELECTOR) ||
        surfaceOwnsSelector(surface, OFFICIAL_MENU_ITEM_SELECTOR)
      )
    );
  }

  function findOpenTrigger() {
    const openTriggers = [...document.querySelectorAll(TRIGGER_SELECTOR)].filter(
      (trigger) =>
        isVisible(trigger) &&
        (trigger.getAttribute("aria-expanded") === "true" ||
          trigger.getAttribute("data-state") === "open"),
    );
    return openTriggers.length === 1 ? openTriggers[0] : null;
  }

  function findPrimarySurface(trigger) {
    if (!trigger) return null;

    const controlledID = trigger.getAttribute("aria-controls");
    if (controlledID) {
      const controlled = document.getElementById(controlledID);
      return controlled && (
        isPrimarySurface(controlled) ||
        isOfficialPrimarySurfaceForProxy(controlled)
      )
        ? controlled
        : null;
    }

    const candidates = [...document.querySelectorAll(PRIMARY_SURFACE_SELECTOR)]
      .filter((surface) =>
        isPrimarySurface(surface) || isOfficialPrimarySurfaceForProxy(surface),
      );
    return candidates.length === 1 ? candidates[0] : null;
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

  function rowMatchesDisplayName(row, value) {
    const normalizedValue = normalizedDisplayName(value);
    return row.catalogDisplayNames.some(
      (displayName) => normalizedDisplayName(displayName) === normalizedValue,
    );
  }

  function officialModelLabelCandidates(values) {
    const candidates = new Set();
    for (const value of Array.isArray(values) ? values : []) {
      const label = String(value || "").replace(/\s+/g, " ").trim();
      if (!label) continue;
      candidates.add(label);
      candidates.add(label.replace(/^GPT[-\s]*/i, ""));
    }
    return [...candidates].filter(Boolean);
  }

  function officialElementTextValues(element) {
    if (!(element instanceof Element)) return [];
    let candidates = [...element.querySelectorAll("span")];
    if (element.matches("span")) candidates.unshift(element);
    candidates = candidates.filter(
      (candidate) => !candidate.closest("[aria-hidden='true'], [inert]"),
    );
    if (candidates.length === 0 && !element.closest("[aria-hidden='true'], [inert]")) {
      candidates.push(element);
    }
    return candidates.map((candidate) =>
      String(candidate.textContent || "").replace(/\s+/g, " ").trim(),
    );
  }

  function officialElementMatchesModelLabels(element, displayNames) {
    return officialExactLabelMatch(
      officialElementTextValues(element),
      officialModelLabelCandidates(displayNames),
    );
  }

  function officialDaybreakProgramControl(surface) {
    if (!surface) return { present: false, control: null };
    const controls = [...surface.querySelectorAll(DAYBREAK_PROGRAM_CONTROL_SELECTOR)]
      .filter((control) => control.closest(PRIMARY_SURFACE_SELECTOR) === surface);
    if (controls.length === 0) return { present: false, control: null };
    const exactLabel = normalizedDisplayName("Daybreak");
    const labeledControls = controls.filter((control) =>
      [control, ...control.querySelectorAll("*")].some(
        (candidate) =>
          normalizedDisplayName(candidate.textContent) === exactLabel,
      )
    );
    return {
      present: true,
      control: labeledControls.length === 1 ? labeledControls[0] : null,
    };
  }

  function officialDaybreakProgramState(surface) {
    const resolved = officialDaybreakProgramControl(surface);
    if (!resolved.present) return { present: false, checked: null };
    const candidate = resolved.control;
    if (!candidate) return { present: true, checked: null };
    const checkedValue = candidate.getAttribute("aria-checked");
    const busyValue = candidate.getAttribute("aria-busy");
    const disabledValue = candidate.getAttribute("aria-disabled");
    const busyOrDisabled =
      busyValue === "true" ||
      (busyValue !== null && busyValue !== "false") ||
      disabledValue === "true" ||
      (disabledValue !== null && disabledValue !== "false") ||
      candidate.matches(":disabled, [data-disabled]");
    return {
      present: true,
      checked: busyOrDisabled
        ? null
        : checkedValue === "true"
        ? true
        : checkedValue === "false"
          ? false
          : null,
    };
  }

  function officialItemsExcludingDaybreakProgram(surface, items) {
    const program = officialDaybreakProgramControl(surface);
    if (program.present && !program.control) return null;
    if (!program.control) return items;
    const programRows = items.filter(
      (item) =>
        item === program.control ||
        item.contains(program.control) ||
        program.control.contains(item),
    );
    if (programRows.length > 1) return null;
    return programRows.length === 1
      ? items.filter((item) => item !== programRows[0])
      : items;
  }

  function assertOfficialDaybreakSelectionPolicy(selection, surface) {
    if (!surface) {
      throw new Error("The current official model picker surface is unavailable.");
    }
    const program = officialDaybreakProgramState(surface);
    const selectedRow = ROWS[selection?.rowIndex] || ALL_ROWS.find((row) =>
      rowMatchesDisplayName(row, selection?.modelName) ||
      row.name.toLocaleLowerCase() ===
        String(selection?.modelName || "").toLocaleLowerCase()
    );
    if (
      program.present &&
      (selectedRow?.id === "daybreak-blue" || program.checked !== false)
    ) {
      throw new Error(
        "The current Codex Daybreak program requires an explicit base-model policy.",
      );
    }
  }

  function officialRowForElement(element, rows = ALL_ROWS) {
    const matches = rows.filter((row) =>
      officialElementMatchesModelLabels(element, row.catalogDisplayNames),
    );
    return matches.length === 1 ? matches[0] : null;
  }

  function currentOfficialCatalogEntryFromModelRow(surface) {
    const currentList = modelListSnapshot(surface);
    if (currentList) return currentList.catalogEntry;
    if (!surface || !state.officialModelCatalog) return null;
    const modelRows = [...surface.querySelectorAll(MODEL_ROW_SELECTOR)]
      .map((marker) => marker.closest(OFFICIAL_MENU_ITEM_SELECTOR) || marker);
    const uniqueRows = [...new Set(modelRows)];
    const matches = state.officialModelCatalog.filter((entry) =>
      uniqueRows.some((row) => {
        const textValues = [row, ...row.querySelectorAll("span")].map(
          (candidate) =>
            String(candidate.textContent || "").replace(/\s+/g, " ").trim(),
        );
        return officialExactLabelMatch(
          textValues,
          officialModelLabelCandidates([entry.displayName]),
        );
      })
    );
    return matches.length === 1 ? matches[0] : null;
  }

  function officialRowFromCurrentModelControls(surface) {
    const catalogEntry = currentOfficialCatalogEntryFromModelRow(surface);
    if (!catalogEntry) return null;
    const matches = ALL_ROWS.filter((row) =>
      rowMatchesDisplayName(row, catalogEntry.displayName)
    );
    return matches.length === 1 ? matches[0] : null;
  }

  function initializeSelectorFromTrigger(trigger) {
    state.currentThreadID = resolveCurrentThreadID(trigger);
    if (state.pendingOfficialSelection && !state.currentThreadID) {
      setSwitchState("pending");
      return;
    }

    state.defaultSelection = false;
    const listSnapshot = modelListSnapshot(state.primarySurface, trigger);
    if (listSnapshot) {
      const selection = listSnapshot.fastMode === null && !listSnapshot.isDefault
        ? { rowIndex: null, indexInRow: null, modelName: "Other", effort: null, fastMode: false }
        : selectionFromModelListSnapshot(listSnapshot);
      applySelection(selection, { render: false });
      state.defaultSelection = listSnapshot.isDefault;
      state.confirmedSelection = null;
      state.confirmedThreadID = null;
      state.lastSwitchError = null;
      setSwitchState(state.currentThreadID ? "ready" : "no-thread");
      return;
    }

    const recognizedRow =
      officialRowForElement(trigger) ||
      officialRowFromCurrentModelControls(state.primarySurface);
    const rowIndex = recognizedRow
      ? ROWS.findIndex((row) => row.id === recognizedRow.id)
      : -1;
    const effort = trigger?.getAttribute("data-selected-reasoning-effort") || "";
    const effortIndex = EFFORTS.indexOf(effort);
    const isRecognized =
      Boolean(recognizedRow) &&
      effortIndex >= 0 &&
      recognizedRow.dots.includes(effortIndex + 1);
    const hasCurrentThread = Boolean(state.currentThreadID);
    const retainedNoThreadSelection = !hasCurrentThread &&
        state.confirmedThreadID === null &&
        Number.isInteger(state.confirmedSelection?.rowIndex) &&
        Number.isInteger(state.confirmedSelection?.indexInRow) &&
        Boolean(
          ROWS[state.confirmedSelection.rowIndex]?.dots[
            state.confirmedSelection.indexInRow
          ],
        )
      ? state.confirmedSelection
      : null;
    const isVisibleSelection =
      isRecognized && rowIndex >= 0 && hasCurrentThread;
    const canPresentRecognizedSelection = isRecognized && hasCurrentThread;

    state.currentRow = retainedNoThreadSelection?.rowIndex ??
      (isVisibleSelection ? rowIndex : null);
    state.currentIndex = retainedNoThreadSelection?.indexInRow ??
      (isVisibleSelection ? effortIndex : null);
    state.recognizedRow = retainedNoThreadSelection
      ? ROWS[retainedNoThreadSelection.rowIndex]
      : canPresentRecognizedSelection
        ? recognizedRow
        : null;
    state.recognizedEffort = retainedNoThreadSelection?.effort ??
      (canPresentRecognizedSelection ? effort : null);
    const officialFastMode = readOfficialFastMode(state.primarySurface);
    state.fastMode = retainedNoThreadSelection
      ? Boolean(retainedNoThreadSelection.fastMode)
      : Boolean(
          isRecognized && recognizedRow.supportsFast && officialFastMode === true,
        );
    state.selectionRevision += 1;
    state.confirmedSelection = retainedNoThreadSelection ||
      (hasCurrentThread && isRecognized &&
        recognizedRow.supportsFast &&
        officialFastMode === true
        ? snapshotSelection()
        : null);
    state.confirmedThreadID = state.confirmedSelection
      ? state.currentThreadID
      : null;
    state.lastSwitchError = null;
    setSwitchState(state.currentThreadID ? "loading" : "no-thread");
    void ensureModelCatalog()
      .then(() => {
        if (state.currentThreadID) {
          const latest = state.latestThreadSettings.get(state.currentThreadID);
          if (latest?.settings) {
            reconcileSettingsNotification(
              state.currentThreadID,
              latest.generation,
            );
          }
          return false;
        }
        // An idle no-task composer must never open nested official controls.
        // The proxy may touch them only inside an explicit selection commit.
        return false;
      })
      .catch(() => {});
  }

  function hasSelectorSelection() {
    return (
      Number.isInteger(state.currentRow) &&
      Number.isInteger(state.currentIndex) &&
      Boolean(ROWS[state.currentRow]?.dots[state.currentIndex])
    );
  }

  function readOfficialFastMode(surface) {
    const controls = surface
      ? [...surface.querySelectorAll(FAST_MODE_SELECTOR)].filter(
        (control) => control.closest(PRIMARY_SURFACE_SELECTOR) === surface,
      )
      : [];
    if (controls.length !== 1) return null;

    const control = controls[0];
    const values = [
      control.getAttribute("data-fast-mode-enabled"),
      control.getAttribute("aria-checked"),
    ].filter((value) => value === "true" || value === "false");
    if (values.length === 0 || new Set(values).size !== 1) return null;
    return values[0] === "true";
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
        modelName: state.defaultSelection ? "Default" : "Other",
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
    state.defaultSelection = selection?.modelName === "Default";
    const explicitlyUnselectable = selection?.rowIndex === null;
    const rowIndex = Number.isInteger(selection?.rowIndex)
      ? selection.rowIndex
      : explicitlyUnselectable
        ? -1
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
      state.defaultSelection = false;
      const row = ROWS[state.currentRow];
      state.recognizedRow = row;
      state.recognizedEffort = EFFORTS[row.dots[state.currentIndex] - 1];
      if (!row.supportsFast) state.fastMode = false;
    }
    state.selectionRevision += 1;
    state.railSelectionGeneration += 1;
    state.lastSwitchError = null;
    updateSelectorUI(host);
  }

  function setSwitchState(value) {
    state.switchState = value;
    state.popoverHost?.setAttribute("data-switch-state", value);
  }

  function resolveCurrentThreadID(trigger) {
    const composer = trigger?.closest("[data-codex-composer-root]") || null;
    if (!composer) return null;
    const directCandidates = [
      trigger?.closest(CONVERSATION_CONTEXT_SELECTOR),
      composer?.closest(CONVERSATION_CONTEXT_SELECTOR),
      composer?.querySelector(CONVERSATION_CONTEXT_SELECTOR),
    ].filter(Boolean);
    return exactValidThreadID(
      directCandidates.map((element) =>
        element.getAttribute("data-above-composer-conversation-id")
      ),
    );
  }

  function captureSelectionIntent() {
    const trigger = findOpenTrigger();
    const composerRoot = trigger?.closest("[data-codex-composer-root]") || null;
    if (!trigger || !composerRoot) {
      throw new Error("The official composer closed before selection was queued.");
    }
    return Object.freeze({
      composerRoot,
      threadID: resolveCurrentThreadID(trigger),
      interactionEpoch: state.officialInteractionEpoch,
    });
  }

  function assertSelectionIntent(intent) {
    const trigger = findOpenTrigger();
    const composerRoot = trigger?.closest("[data-codex-composer-root]") || null;
    const threadID = resolveCurrentThreadID(trigger);
    if (!selectionIntentIdentityMatches(
      intent?.threadID,
      threadID,
      Boolean(intent?.composerRoot && composerRoot === intent.composerRoot),
      Boolean(trigger),
      intent?.interactionEpoch,
      state.officialInteractionEpoch,
    )) {
      throw new Error("The composer or task changed after selection was queued.");
    }
    return trigger;
  }

  function selectionIntentIsCurrent(intent) {
    try {
      return Boolean(assertSelectionIntent(intent));
    } catch (_) {
      return false;
    }
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

  function normalizedOfficialModelCatalog(result) {
    const models = Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result?.models)
        ? result.models
        : [];
    return models.flatMap((model) => {
      if (
        typeof model?.model !== "string" ||
        model.model.length === 0 ||
        typeof model.displayName !== "string" ||
        model.displayName.trim().length === 0
      ) {
        return [];
      }
      const supportedEffortOrder = (model.supportedReasoningEfforts || [])
        .map((entry) =>
          typeof entry === "string"
            ? entry
            : entry?.reasoningEffort || entry?.effort || null,
        )
        .filter((effort) => typeof effort === "string" && effort.length > 0);
      const supportedEfforts = new Set(supportedEffortOrder);
      const serviceTiers = Array.isArray(model.serviceTiers)
        ? model.serviceTiers
        : [];
      const fastTierIndex = serviceTiers.findIndex(
        (tier) =>
          ["priority", "fast"].includes(
            String(tier?.id || tier?.serviceTier || "").toLocaleLowerCase(),
          ) ||
          String(tier?.name || "").trim().toLocaleLowerCase() === "fast",
      );
      const fastTier = fastTierIndex >= 0 ? serviceTiers[fastTierIndex] : null;
      return [{
        model: model.model,
        displayName: model.displayName,
        hidden: model.hidden === true,
        supportedEfforts,
        supportedEffortOrder,
        serviceTierOptionCount: serviceTiers.length + 1,
        fastTierOptionIndex: fastTierIndex >= 0 ? fastTierIndex + 1 : null,
        fastTierID: fastTier?.id || fastTier?.serviceTier || null,
      }];
    });
  }

  function normalizedSelectableModelCatalog(officialCatalog) {
    return ROWS.map((row, rowIndex) => {
      const matches = officialCatalog.filter((candidate) =>
        candidate?.hidden !== true &&
        rowMatchesDisplayName(row, candidate?.displayName),
      );
      if (matches.length !== 1) return null;
      const model = matches[0];
      const requiredEfforts = row.dots.map((dotNumber) => EFFORTS[dotNumber - 1]);
      if (requiredEfforts.some((effort) => !model.supportedEfforts.has(effort))) {
        return null;
      }
      return {
        ...model,
        rowIndex,
        fastTierID: row.supportsFast ? model.fastTierID : null,
      };
    });
  }

  async function loadOfficialModelCatalog() {
    const catalog = [];
    const seenCursors = new Set();
    let cursor = null;
    do {
      const result = await sendAppServerRequest("model/list", {
        cursor,
        includeHidden: true,
        limit: 100,
      });
      catalog.push(...normalizedOfficialModelCatalog(result));
      const nextCursor = result?.nextCursor ?? result?.next_cursor ?? null;
      if (nextCursor === null) return catalog;
      if (
        typeof nextCursor !== "string" ||
        nextCursor.length === 0 ||
        seenCursors.has(nextCursor)
      ) {
        throw new Error("Codex returned an invalid model catalog cursor.");
      }
      seenCursors.add(nextCursor);
      cursor = nextCursor;
    } while (cursor !== null);
    return catalog;
  }

  function ensureModelCatalog() {
    if (state.modelCatalog) return Promise.resolve(state.modelCatalog);
    if (state.modelCatalogPromise) return state.modelCatalogPromise;

    setSwitchState("loading");
    state.modelCatalogPromise = loadOfficialModelCatalog()
      .then((officialCatalog) => {
        state.officialModelCatalog = officialCatalog;
        state.modelCatalog = normalizedSelectableModelCatalog(
          state.officialModelCatalog,
        );
        setSwitchState(state.currentThreadID ? "ready" : "no-thread");
        const latest = state.currentThreadID
          ? state.latestThreadSettings.get(state.currentThreadID)
          : null;
        if (latest?.settings) {
          reconcileSettingsNotification(
            state.currentThreadID,
            latest.generation,
          );
        }
        state.officialSelectionDirty = true;
        scheduleSync();
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

  function refreshThreadDaybreakClassification(threadID, generation) {
    const key = `${threadID}:${generation}`;
    if (state.threadClassificationPromise) {
      if (state.threadClassificationKey === key) {
        // Coalesce duplicate requests instead of creating a self-retry loop.
        return state.threadClassificationPromise;
      }
      return state.threadClassificationPromise
        .catch(() => false)
        .then(() => refreshThreadDaybreakClassification(threadID, generation));
    }

    const task = state.commitQueue.catch(() => {}).then(async () => {
      const trigger = findOpenTrigger();
      const composerRoot =
        trigger?.closest("[data-codex-composer-root]") || null;
      const latest = state.latestThreadSettings.get(threadID);
      if (
        !trigger ||
        !composerRoot ||
        resolveCurrentThreadID(trigger) !== threadID ||
        latest?.generation !== generation ||
        latest.reconciled === true
      ) {
        return false;
      }
      state.officialProxyReadDepth += 1;

      const parsedSelection = selectionFromThreadSettings(latest.settings);
      const officialEntries = state.officialModelCatalog?.filter(
        (entry) => entry?.model === latest.settings?.model,
      ) || [];
      const policySelection = parsedSelection || {
        rowIndex: null,
        indexInRow: null,
        modelName: officialEntries.length === 1
          ? officialEntries[0].displayName
          : "Other",
        effort: latest.settings?.effort ||
          latest.settings?.reasoningEffort || null,
        fastMode: false,
      };
      const context = {
        composerRoot,
        threadID,
        expandedAdvanced: false,
        interruptedByUserInput: false,
      };
      let removeInputGuard = null;
      try {
        removeInputGuard = installOfficialProxyInputGuard(context);
        await assertOfficialDaybreakSelectionPolicyReady(
          policySelection,
          context,
        );
        assertOfficialProxyContext(context);
        assertOfficialDaybreakStateUnchanged(context);
        const currentLatest = state.latestThreadSettings.get(threadID);
        if (currentLatest?.generation !== generation) return false;
        reconcileSettingsNotification(threadID, generation);
        return currentLatest.reconciled === true;
      } catch (_) {
        return false;
      } finally {
        try {
          await restoreOfficialPickerView(context);
        } catch (_) {}
        removeInputGuard?.();
        state.officialProxyReadDepth = Math.max(
          0,
          state.officialProxyReadDepth - 1,
        );
      }
    });
    state.threadClassificationPromise = task.finally(() => {
      state.threadClassificationPromise = null;
      state.threadClassificationKey = null;
    });
    state.threadClassificationKey = key;
    state.commitQueue = state.threadClassificationPromise.catch(() => {});
    return state.threadClassificationPromise;
  }

  function selectionFromThreadSettings(settings) {
    if (!settings || !state.modelCatalog || !state.officialModelCatalog) {
      return null;
    }
    const selectableCatalogEntry = state.modelCatalog.find(
      (entry) => entry?.model === settings.model,
    );
    const officialEntries = selectableCatalogEntry
      ? [selectableCatalogEntry]
      : state.officialModelCatalog.filter(
          (entry) => entry?.model === settings.model,
        );
    const recognizedRows = officialEntries.length === 1
      ? ALL_ROWS.filter((row) =>
          rowMatchesDisplayName(row, officialEntries[0].displayName)
        )
      : [];
    if (recognizedRows.length !== 1) {
      return {
        rowIndex: null,
        indexInRow: null,
        modelName: "Other",
        effort: null,
        fastMode: false,
      };
    }

    const catalogEntry = officialEntries[0];
    const effort = settings.effort || settings.reasoningEffort || null;
    const effortIndex = EFFORTS.indexOf(effort);
    const row = recognizedRows[0];
    if (effortIndex < 0 || !row.dots.includes(effortIndex + 1)) return null;
    const fastMode = officialServiceTierFastState(
      settings.serviceTier,
      row.supportsFast ? catalogEntry.fastTierID : null,
    );
    if (fastMode === null) return null;
    return {
      rowIndex: selectableCatalogEntry ? selectableCatalogEntry.rowIndex : null,
      indexInRow: selectableCatalogEntry ? effortIndex : null,
      modelName: row.name,
      effort,
      fastMode,
    };
  }

  function createSettingsWaiter(threadID, target, afterGeneration) {
    let timeoutID = null;
    let waiter = null;
    const promise = new Promise((resolve, reject) => {
      waiter = { threadID, target, afterGeneration, resolve, reject };
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

  function reconcileSettingsNotification(threadID, generation) {
    const latest = state.latestThreadSettings.get(threadID);
    if (
      !latest ||
      latest.generation !== generation ||
      !state.modelCatalog ||
      threadID !== state.currentThreadID
    ) {
      return;
    }
    const replayIsOlderThanActiveWaiter =
      state.commitInFlight &&
      state.commitThreadID === threadID &&
      [...state.settingsWaiters].some(
        (waiter) =>
          waiter.threadID === threadID &&
          generation <= waiter.afterGeneration,
      );
    if (replayIsOlderThanActiveWaiter) return;
    const settings = latest.settings;
    const trigger = findOfficialComposerTrigger();
    const surface = trigger ? findPrimarySurface(trigger) : state.primarySurface;
    const daybreakProgram = officialDaybreakProgramState(surface);
    const currentList = modelListSnapshot(surface, trigger);
    if (currentList?.isDefault && !state.commitInFlight) {
      latest.reconciled = true;
      latest.selection = null;
      state.confirmedSelection = null;
      state.confirmedThreadID = null;
      applySelection(selectionFromModelListSnapshot(currentList));
      setSwitchState("ready");
      return;
    }
    const composerRoot =
      trigger?.closest("[data-codex-composer-root]") || null;
    const liveLegacyModelProven =
      state.daybreakClassification?.composerRoot === composerRoot &&
      state.daybreakClassification?.kind === "legacy-model" &&
      state.daybreakClassification?.structureGeneration ===
        state.officialStructureMutationGeneration &&
      state.daybreakClassification?.programGeneration ===
        state.officialDaybreakProgramMutationGeneration;
    const cachedLegacyModelProven =
      latest.legacyModelProven === true &&
      latest.legacyStructureGeneration ===
        state.officialStructureMutationGeneration &&
      latest.legacyProgramGeneration ===
        state.officialDaybreakProgramMutationGeneration;
    const legacyModelProven =
      cachedLegacyModelProven || liveLegacyModelProven ||
      Boolean(modelListSnapshot(surface));
    const daybreakStateAllowsConfirmation =
      daybreakProgramAllowsBaseConfirmation(
        daybreakProgram.present,
        daybreakProgram.checked,
        legacyModelProven,
      );
    if (!daybreakProgram.present && !legacyModelProven) {
      if (!latest.intentInvalidated) {
        cancelPendingKeyboardCommit();
        state.officialInteractionEpoch += 1;
        state.selectionRevision += 1;
        latest.intentInvalidated = true;
      }
      latest.selection = null;
      latest.reconciled = false;
      state.confirmedSelection = null;
      state.confirmedThreadID = null;
      applySelection({
        rowIndex: null,
        indexInRow: null,
        modelName: "Other",
        effort: null,
        fastMode: false,
      });
      setSwitchState("loading");
      return;
    }
    const daybreakBlocksConfirmation = !daybreakStateAllowsConfirmation;
    const confirmed = daybreakBlocksConfirmation
      ? null
      : selectionFromThreadSettings(settings);
    const firstReconciliation = latest.reconciled !== true;
    latest.reconciled = true;
    latest.selection = confirmed;
    if (!daybreakProgram.present && confirmed && liveLegacyModelProven) {
      latest.legacyModelProven = true;
      latest.legacyStructureGeneration =
        state.officialStructureMutationGeneration;
      latest.legacyProgramGeneration =
        state.officialDaybreakProgramMutationGeneration;
    }
    const matchingWaiters = confirmed
      ? [...state.settingsWaiters].filter(
          (waiter) =>
            waiter.threadID === threadID &&
            generation > waiter.afterGeneration &&
            selectionsEqual(waiter.target, confirmed),
        )
      : [];
    const expectedCurrentCommitNotification =
      state.commitInFlight &&
      state.commitThreadID === threadID &&
      matchingWaiters.length > 0;
    if (
      firstReconciliation &&
      !expectedCurrentCommitNotification &&
      !latest.intentInvalidated
    ) {
      cancelPendingKeyboardCommit();
      state.officialInteractionEpoch += 1;
      state.selectionRevision += 1;
      latest.intentInvalidated = true;
    }
    if (!confirmed) {
      const error = new Error(daybreakBlocksConfirmation
        ? "The current Codex Daybreak program state cannot confirm one base model."
        : "Codex reported an unsupported effort or service tier for the current model.");
      state.confirmedSelection = null;
      state.confirmedThreadID = null;
      state.lastSwitchError = error;
      applySelection({
        rowIndex: null,
        indexInRow: null,
        modelName: "Other",
        effort: null,
        fastMode: false,
      });
      setSwitchState("error");
      return;
    }

    state.confirmedSelection = confirmed;
    state.confirmedThreadID = threadID;
    for (const waiter of matchingWaiters) {
      window.clearTimeout(waiter.timeoutID);
      state.settingsWaiters.delete(waiter);
      waiter.resolve({ selection: confirmed, generation });
    }
    if (!expectedCurrentCommitNotification) {
      applySelection(confirmed);
      setSwitchState("confirmed");
    }
  }

  function confirmSettingsNotification(threadID, settings) {
    if (!isValidThreadID(threadID)) return;
    const trigger = findOfficialComposerTrigger();
    const liveThreadID = trigger
      ? resolveCurrentThreadID(trigger)
      : state.currentThreadID;
    if (threadID === liveThreadID && state.currentThreadID !== liveThreadID) {
      cancelPendingKeyboardCommit();
      state.officialInteractionEpoch += 1;
      state.selectionRevision += 1;
      state.currentThreadID = liveThreadID;
      state.confirmedSelection = null;
      state.confirmedThreadID = null;
      state.daybreakClassification = null;
      state.lastSwitchError = null;
      state.officialSelectionDirty = true;
    }
    const generation = state.settingsNotificationGeneration + 1;
    state.settingsNotificationGeneration = generation;
    state.latestThreadSettings.set(threadID, {
      generation,
      legacyModelProven: false,
      legacyStructureGeneration: null,
      legacyProgramGeneration: null,
      intentInvalidated: false,
      selection: null,
      settings: settings ? { ...settings } : null,
      reconciled: false,
    });
    if (threadID !== liveThreadID) return;
    reconcileSettingsNotification(threadID, generation);
    const latest = state.latestThreadSettings.get(threadID);
    if (latest?.generation === generation && latest.reconciled !== true) {
      void ensureModelCatalog()
        .then(() => refreshThreadDaybreakClassification(threadID, generation))
        .catch(() => false);
    }
    if (state.officialSelectionDirty) scheduleSync();
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

  function officialControlIsUsable(element) {
    return Boolean(
      element instanceof HTMLElement &&
      isVisible(element) &&
      !element.matches(":disabled, [aria-disabled='true'], [data-disabled]") &&
      !element.closest("[aria-hidden='true'], [inert]"),
    );
  }

  function officialItemsInSurface(surface) {
    if (!surface) return [];
    return [...surface.querySelectorAll(OFFICIAL_MENU_ITEM_SELECTOR)].filter(
      (item) =>
        officialControlIsUsable(item) &&
        item.closest(PRIMARY_SURFACE_SELECTOR) === surface,
    );
  }

  function officialLeafItemsInSurface(surface) {
    if (!surface) return [];
    return [...surface.querySelectorAll(OFFICIAL_LEAF_ITEM_SELECTOR)].filter(
      (item) =>
        officialControlIsUsable(item) &&
        item.closest(PRIMARY_SURFACE_SELECTOR) === surface,
    );
  }

  function findOfficialComposerTrigger() {
    const candidates = [...document.querySelectorAll(TRIGGER_SELECTOR)].filter(
      officialControlIsUsable,
    );
    const openCandidates = candidates.filter(
      (trigger) =>
        trigger.getAttribute("aria-expanded") === "true" ||
        trigger.getAttribute("data-state") === "open",
    );
    if (openCandidates.length > 0) {
      return openCandidates.length === 1 ? openCandidates[0] : null;
    }
    return candidates.length === 1 ? candidates[0] : null;
  }

  function officialProxyContextTrigger(context) {
    if (context?.interruptedByUserInput) return null;
    const trigger = findOfficialComposerTrigger();
    if (!trigger || !context?.composerRoot) return null;
    const composerRoot = trigger.closest("[data-codex-composer-root]");
    const expectedThreadID = context.threadID || null;
    if (
      composerRoot !== context.composerRoot ||
      resolveCurrentThreadID(trigger) !== expectedThreadID
    ) {
      return null;
    }
    return trigger;
  }

  function installOfficialProxyInputGuard(context) {
    const markInterrupted = (event) => {
      if (!event.isTrusted) return;
      const path = typeof event.composedPath === "function"
        ? event.composedPath()
        : [];
      if (event.type === "click" && path.includes(state.popoverHost)) return;
      if (!eventTargetsOfficialPicker(event)) return;
      context.interruptedByUserInput = true;
    };
    const eventNames = ["pointerdown", "wheel", "keydown", "click"];
    for (const eventName of eventNames) {
      document.addEventListener(eventName, markInterrupted, true);
    }
    return () => {
      for (const eventName of eventNames) {
        document.removeEventListener(eventName, markInterrupted, true);
      }
    };
  }

  function assertOfficialProxyContext(context) {
    const trigger = officialProxyContextTrigger(context);
    if (!trigger) {
      throw new Error(
        "The original no-task composer changed during official selection.",
      );
    }
    return trigger;
  }

  function waitForOfficialState(
    predicate,
    failureMessage,
    timeoutMs = OFFICIAL_CONTROL_TIMEOUT_MS,
  ) {
    return new Promise((resolve, reject) => {
      const startedAt = performance.now();
      let lastError = null;
      const poll = () => {
        if (state.disposed) {
          reject(new Error("Copicker was disposed while waiting for an official control."));
          return;
        }
        try {
          const result = predicate();
          if (result) {
            resolve(result);
            return;
          }
        } catch (error) {
          lastError = error;
        }
        if (performance.now() - startedAt >= timeoutMs) {
          const suffix = lastError instanceof Error ? ` ${lastError.message}` : "";
          reject(new Error(`${failureMessage}${suffix}`));
          return;
        }
        window.requestAnimationFrame(poll);
      };
      poll();
    });
  }

  function clickOfficialControl(control) {
    if (!officialControlIsUsable(control)) {
      throw new Error("The required official Codex control is unavailable.");
    }
    const rect = control.getBoundingClientRect();
    if (typeof PointerEvent === "function") {
      control.dispatchEvent(new PointerEvent("pointermove", {
        bubbles: true,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        pointerType: "mouse",
      }));
    }
    control.focus({ preventScroll: true });
    control.click();
  }

  function pressOfficialComposerTrigger(control) {
    if (!officialControlIsUsable(control)) {
      throw new Error("The required official Codex trigger is unavailable.");
    }
    const rect = control.getBoundingClientRect();
    const eventInit = {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
    };
    control.focus({ preventScroll: true });
    if (typeof PointerEvent === "function") {
      control.dispatchEvent(new PointerEvent("pointerdown", {
        ...eventInit,
        button: 0,
        buttons: 1,
      }));
      control.dispatchEvent(new PointerEvent("pointerup", {
        ...eventInit,
        button: 0,
        buttons: 0,
      }));
      return true;
    }
    control.click();
    return false;
  }

  function isOfficialPrimarySurfaceForProxy(surface) {
    const ownedSliders = surface
      ? [...surface.querySelectorAll(REASONING_SLIDER_SELECTOR)].filter(
        (slider) => slider.closest(PRIMARY_SURFACE_SELECTOR) === surface,
      )
      : [];
    const hasPowerLayout = ownedSliders.length > 0 && (
      surfaceOwnsSelector(surface, PRIMARY_CONTROL_SELECTOR) ||
      surfaceOwnsSelector(surface, MODEL_ROW_SELECTOR) ||
      officialItemsInSurface(surface).length > 0
    );
    const hasMarkedFlatLayout =
      surfaceOwnsSelector(surface, MODEL_ROW_SELECTOR) &&
      surfaceOwnsSelector(surface, OFFICIAL_SELECTED_EFFORT_SELECTOR) &&
      officialItemsInSurface(surface).length > 0;
    const ownedItems = officialItemsInSurface(surface);
    const structuralItems = officialItemsExcludingDaybreakProgram(
      surface,
      ownedItems,
    );
    const hasExactThreeFlyoutLayout =
      surfaceOwnsSelector(surface, MODEL_ROW_SELECTOR) &&
      Array.isArray(structuralItems) &&
      structuralItems.length === 3 &&
      structuralItems.every((item) =>
        item.matches(OFFICIAL_SUBMENU_TRIGGER_SELECTOR)
      );
    return Boolean(
      surface &&
      isVisible(surface) &&
      !surface.closest("[aria-hidden='true'], [inert]") &&
      !surface.matches(SECONDARY_SURFACE_SELECTOR) &&
      !surface.closest(SECONDARY_SURFACE_SELECTOR) &&
      (hasPowerLayout || hasMarkedFlatLayout || hasExactThreeFlyoutLayout),
    );
  }

  function findOfficialPrimarySurfaceForProxy(trigger) {
    const controlledID = trigger?.getAttribute("aria-controls");
    if (controlledID) {
      const controlled = document.getElementById(controlledID);
      return isOfficialPrimarySurfaceForProxy(controlled) ? controlled : null;
    }

    const candidates = [...document.querySelectorAll(PRIMARY_SURFACE_SELECTOR)]
      .filter(isOfficialPrimarySurfaceForProxy);
    return candidates.length === 1 ? candidates[0] : null;
  }

  function currentOpenOfficialPrimaryTarget() {
    const trigger = findOfficialComposerTrigger();
    if (!trigger) return null;
    if (
      trigger.getAttribute("aria-expanded") !== "true" &&
      trigger.getAttribute("data-state") !== "open"
    ) {
      return null;
    }
    const surface = findOfficialPrimarySurfaceForProxy(trigger);
    return surface ? { trigger, surface } : null;
  }

  async function ensureOfficialPrimaryOpen(context) {
    const trigger = context?.composerRoot
      ? assertOfficialProxyContext(context)
      : findOfficialComposerTrigger();
    if (!trigger) {
      throw new Error("Copicker could not resolve one exact official model trigger.");
    }

    const existing = currentOpenOfficialPrimaryTarget();
    if (existing) {
      state.trigger = existing.trigger;
      state.primarySurface = existing.surface;
      return existing;
    }

    if (context?.composerRoot) assertOfficialProxyContext(context);
    const usedPointerEvents = pressOfficialComposerTrigger(trigger);
    let target = null;
    if (usedPointerEvents) {
      try {
        target = await waitForOfficialState(
          currentOpenOfficialPrimaryTarget,
          "The pointer-down model picker activation did not open.",
          OFFICIAL_POINTER_OPEN_GRACE_MS,
        );
      } catch (error) {
        if (state.disposed) throw error;
      }
      if (!target) {
        const fallbackTrigger = context?.composerRoot
          ? assertOfficialProxyContext(context)
          : findOfficialComposerTrigger();
        if (!fallbackTrigger) {
          throw new Error("Copicker could not re-resolve the official model trigger.");
        }
        const reportsOpen =
          fallbackTrigger.getAttribute("aria-expanded") === "true" ||
          fallbackTrigger.getAttribute("data-state") === "open";
        if (!reportsOpen) {
          if (context?.composerRoot) assertOfficialProxyContext(context);
          clickOfficialControl(fallbackTrigger);
        }
      }
    }
    target ||= await waitForOfficialState(
      currentOpenOfficialPrimaryTarget,
      "The official model picker did not open.",
    );
    if (context?.composerRoot) assertOfficialProxyContext(context);
    state.trigger = target.trigger;
    state.primarySurface = target.surface;
    return target;
  }

  function currentOfficialCatalogEntry(
    trigger = findOfficialComposerTrigger(),
  ) {
    if (!trigger || !state.officialModelCatalog) return null;
    const matches = state.officialModelCatalog.filter((entry) =>
      officialElementMatchesModelLabels(trigger, [entry.displayName]),
    );
    return matches.length === 1 ? matches[0] : null;
  }

  function currentOfficialEffortExpectation(surface) {
    const trigger = findOfficialComposerTrigger();
    const catalogEntry =
      currentOfficialCatalogEntry(trigger) ||
      currentOfficialCatalogEntryFromModelRow(surface);
    if (!trigger || !catalogEntry) return null;
    const effort = trigger.getAttribute("data-selected-reasoning-effort") || "";
    const selectedIndex = catalogEntry?.supportedEffortOrder.indexOf(effort) ?? -1;
    if (selectedIndex < 0) return null;
    return {
      count: catalogEntry.supportedEffortOrder.length,
      selectedIndex,
    };
  }

  function modelListRoot(surface) {
    if (!surface) return null;
    const roots = [...surface.querySelectorAll(MODEL_LIST_VIEW_SELECTOR)].filter(
      (root) => root.closest(PRIMARY_SURFACE_SELECTOR) === surface &&
        ["simple", "advanced"].includes(root.getAttribute("data-model-picker-view")) &&
        root.querySelector(MODEL_RADIO_SELECTOR) &&
        root.querySelector("[data-explicit-model]") &&
        root.querySelector(REASONING_SLIDER_SELECTOR),
    );
    return roots.length === 1 ? roots[0] : null;
  }

  function modelListSnapshot(surface, trigger = findOfficialComposerTrigger()) {
    const root = modelListRoot(surface);
    if (!root || !trigger || !state.officialModelCatalog) return null;
    const explicitControls = [...root.querySelectorAll("[data-explicit-model]")];
    if (explicitControls.length !== 1) return null;
    const explicitValue = explicitControls[0].getAttribute("data-explicit-model");
    if (!["true", "false"].includes(explicitValue)) return null;
    // Both views remain mounted. Read their checked state without opening them.
    const options = [...root.querySelectorAll(MODEL_RADIO_SELECTOR)].map((element) => {
      const labelValues = [element, ...element.querySelectorAll("span")].map(
        (label) => String(label.textContent || "").replace(/\s+/g, " ").trim(),
      );
      const matches = state.officialModelCatalog.filter((entry) =>
        officialExactLabelMatch(labelValues, officialModelLabelCandidates([entry.displayName])),
      );
      return {
        element,
        catalogEntry: matches.length === 1 ? matches[0] : null,
        model: matches.length === 1 ? matches[0].model : null,
        selected: element.getAttribute("aria-checked") === "true",
        markedSelected: element.getAttribute("data-model-selected") === "true",
        locked: element.hasAttribute("aria-describedby"),
      };
    });
    const kind = modelListSelectionKind(options, explicitValue === "true");
    if (!kind) return null;
    const selected = options.find((option) => option.selected);
    const effort = trigger.getAttribute("data-selected-reasoning-effort");
    if (kind !== "default" && (!EFFORTS.includes(effort) ||
        !selected.catalogEntry.supportedEfforts.has(effort))) return null;
    const checkboxState = readOfficialFastMode(surface);
    const fastMode = checkboxState ??
      (selected.catalogEntry?.serviceTierOptionCount === 1 ? false : null);
    return {
      root, options, catalogEntry: selected.catalogEntry,
      isDefault: kind === "default", effort, fastMode,
    };
  }

  function selectionFromModelListSnapshot(snapshot) {
    const row = snapshot.catalogEntry && ALL_ROWS.find((candidate) =>
      rowMatchesDisplayName(candidate, snapshot.catalogEntry.displayName),
    );
    const rowIndex = row ? ROWS.indexOf(row) : -1;
    const recognized = row && EFFORTS.includes(snapshot.effort);
    return {
      rowIndex: recognized && rowIndex >= 0 ? rowIndex : null,
      indexInRow: recognized && rowIndex >= 0 ? EFFORTS.indexOf(snapshot.effort) : null,
      modelName: snapshot.isDefault ? "Default" : row?.name || "Other",
      effort: snapshot.isDefault ? null : recognized ? snapshot.effort : null,
      fastMode: Boolean(row?.supportsFast && snapshot.fastMode),
    };
  }

  function currentModelListSnapshot(context) {
    const trigger = assertOfficialProxyContext(context);
    const surface = findOfficialPrimarySurfaceForProxy(trigger);
    const snapshot = modelListSnapshot(surface, trigger);
    if (!snapshot || officialDaybreakProgramState(surface).present) {
      throw new Error("The current Codex model-list layout changed or is ambiguous.");
    }
    return { ...snapshot, surface, trigger };
  }

  async function openModelList(context) {
    let snapshot = currentModelListSnapshot(context);
    if (snapshot.root.getAttribute("data-model-picker-view") === "advanced") return snapshot;
    const toggle = await waitForOfficialState(() => {
      snapshot = currentModelListSnapshot(context);
      const toggles = [...snapshot.root.querySelectorAll("[data-model-picker-view-toggle]")]
        .filter(officialControlIsUsable);
      return toggles.length === 1 ? toggles[0] : null;
    }, "The model-list control stayed unavailable.", OFFICIAL_TRANSIENT_CONTROL_TIMEOUT_MS);
    assertOfficialProxyContext(context);
    clickOfficialControl(toggle);
    return waitForOfficialState(() => {
      const current = currentModelListSnapshot(context);
      return current.root.getAttribute("data-model-picker-view") === "advanced" ? current : null;
    }, "The official model list did not open.");
  }

  async function chooseModelListEntry(entry, context, beforeMutation = () => {}) {
    const snapshot = await openModelList(context);
    const options = snapshot.options.filter((option, index) =>
      entry ? option.model === entry.model : index === 0 && option.model === null,
    );
    if (options.length !== 1 || options[0].locked || entry?.hidden ||
        !officialControlIsUsable(options[0].element)) {
      throw new Error("The requested official model is unavailable or locked.");
    }
    assertOfficialProxyContext(context);
    if (!options[0].selected) beforeMutation();
    clickOfficialControl(options[0].element);
    return waitForOfficialState(() => {
      const current = currentModelListSnapshot(context);
      const selected = entry
        ? !current.isDefault && current.catalogEntry?.model === entry.model
        : current.isDefault;
      return selected && current.root.getAttribute("data-model-picker-view") === "simple"
        ? current : null;
    }, "The official model list did not confirm the requested model.");
  }

  async function ensureModelListSimple(context) {
    const snapshot = currentModelListSnapshot(context);
    return snapshot.root.getAttribute("data-model-picker-view") === "simple"
      ? snapshot : chooseModelListEntry(snapshot.catalogEntry, context);
  }

  async function setModelListEffort(effort, entry, context, beforeMutation = () => {}) {
    const seen = new Set();
    for (let step = 0; step < EFFORTS.length; step += 1) {
      const snapshot = await ensureModelListSimple(context);
      if (snapshot.isDefault || snapshot.catalogEntry?.model !== entry.model) {
        throw new Error("The model changed while setting reasoning effort.");
      }
      if (snapshot.effort === effort) return;
      if (!entry.supportedEfforts.has(effort) || seen.has(snapshot.effort)) break;
      seen.add(snapshot.effort);
      const sliders = [...snapshot.root.querySelectorAll(REASONING_SLIDER_SELECTOR)]
        .filter(officialControlIsUsable);
      if (sliders.length !== 1) break;
      const key = EFFORTS.indexOf(effort) < EFFORTS.indexOf(snapshot.effort)
        ? "ArrowLeft" : "ArrowRight";
      assertOfficialProxyContext(context);
      beforeMutation();
      // Route only this synchronous synthetic key past our own rail handler.
      state.modelListKeyboardDispatch = true;
      try {
        sliders[0].dispatchEvent(new KeyboardEvent("keydown", {
          key, code: key, bubbles: true, cancelable: true,
        }));
      } finally {
        state.modelListKeyboardDispatch = false;
      }
      await waitForOfficialState(() => {
        const current = currentModelListSnapshot(context);
        return current.effort !== snapshot.effort ? current : null;
      }, "The official strength slider did not advance.", 750);
    }
    throw new Error("The requested effort is not reachable in the current official slider.");
  }

  async function setModelListFast(enabled, context, beforeMutation = () => {}, normalize = false) {
    const snapshot = await ensureModelListSimple(context);
    if (snapshot.fastMode === null) throw new Error("The current Speed selection is ambiguous.");
    if (snapshot.catalogEntry?.serviceTierOptionCount === 1) {
      if (enabled) throw new Error("Fast is unavailable for this model.");
      return;
    }
    const controls = [...snapshot.root.querySelectorAll(FAST_MODE_SELECTOR)].filter(officialControlIsUsable);
    if (controls.length !== 1) throw new Error("The official Fast checkbox is unavailable.");
    if (snapshot.fastMode === enabled && !(normalize && !enabled)) return;
    assertOfficialProxyContext(context);
    beforeMutation();
    clickOfficialControl(controls[0]);
    await waitForOfficialState(() => {
      const current = currentModelListSnapshot(context);
      return current.fastMode === !snapshot.fastMode ? current : null;
    }, "The official Fast checkbox did not confirm the change.");
    if (!enabled && !snapshot.fastMode) {
      await setModelListFast(false, context, beforeMutation);
    }
  }

  async function performModelListControlProxy(selection, catalogEntry, intent) {
    const context = { composerRoot: intent.composerRoot, interruptedByUserInput: false };
    const removeGuard = installOfficialProxyInputGuard(context);
    const epoch = state.officialInteractionEpoch;
    let baseline = null;
    let mutationStarted = false;
    let normalizedStandard = false;
    const beforeMutation = () => {
      assertSelectionIntent(intent);
      assertOfficialProxyContext(context);
      mutationStarted = true;
    };
    state.officialProxyReadDepth += 1;
    try {
      assertSelectionIntent(intent);
      await ensureOfficialPrimaryOpen(context);
      baseline = currentModelListSnapshot(context);
      if (baseline.fastMode === null || baseline.catalogEntry?.hidden) {
        throw new Error("The initial official selection cannot be restored exactly.");
      }
      const target = baseline.options.filter((option) => option.model === catalogEntry.model);
      if (target.length !== 1 || target[0].locked ||
          target[0].element.matches('[data-disabled],[aria-disabled="true"]')) {
        throw new Error("The target model is disabled or locked.");
      }
      await ensureModelListSimple(context);
      if (!baseline.fastMode) {
        await setModelListFast(false, context, beforeMutation, true);
        normalizedStandard = mutationStarted;
      } else if (!selection.fastMode || !catalogEntry.fastTierID) {
        await setModelListFast(false, context, beforeMutation);
      }
      await chooseModelListEntry(catalogEntry, context, beforeMutation);
      await setModelListEffort(selection.effort, catalogEntry, context, beforeMutation);
      await setModelListFast(Boolean(selection.fastMode), context, beforeMutation);
      for (let pass = 0; pass < 2; pass += 1) {
        const current = currentModelListSnapshot(context);
        if (current.isDefault || current.fastMode === null ||
            !selectionsEqual(selectionFromModelListSnapshot(current), selection)) {
          throw new Error("The official model, effort, and speed did not confirm the selection.");
        }
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      assertSelectionIntent(intent);
      state.defaultSelection = false;
      return selectionFromModelListSnapshot(currentModelListSnapshot(context));
    } catch (error) {
      if (mutationStarted && baseline) {
        let restored = false;
        if (officialProxyContextTrigger(context) && state.officialInteractionEpoch === epoch) {
          try {
            await chooseModelListEntry(baseline.catalogEntry, context);
            if (!baseline.isDefault) await setModelListEffort(baseline.effort, baseline.catalogEntry, context);
            await setModelListFast(baseline.fastMode, context);
            const current = currentModelListSnapshot(context);
            restored = current.isDefault === baseline.isDefault &&
              current.catalogEntry?.model === baseline.catalogEntry?.model &&
              current.effort === baseline.effort && current.fastMode === baseline.fastMode;
          } catch {}
        }
        error.officialRollbackStatus = restored ? normalizedStandard ? "restored-normalized" : "restored" : "failed";
        error.rollbackSelection = restored ? selectionFromModelListSnapshot(baseline) : null;
      }
      throw error;
    } finally {
      removeGuard();
      state.officialProxyReadDepth = Math.max(0, state.officialProxyReadDepth - 1);
      if (!officialProxyContextTrigger(context) || state.officialInteractionEpoch !== epoch) {
        state.officialSelectionDirty = true;
      }
    }
  }

  function officialAdvancedRows(surface) {
    const modelTriggers = [...surface.querySelectorAll(MODEL_ROW_SELECTOR)]
      .map((label) => label.closest(OFFICIAL_MENU_ITEM_SELECTOR))
      .filter(
        (item) =>
          officialControlIsUsable(item) &&
          item.closest(PRIMARY_SURFACE_SELECTOR) === surface,
      );
    const uniqueModelTriggers = [...new Set(modelTriggers)];
    if (uniqueModelTriggers.length > 1) return null;

    const activePanels = [...surface.querySelectorAll("[data-active='true']")]
      .filter(
        (panel) =>
          officialControlIsUsable(panel) &&
          panel.closest(PRIMARY_SURFACE_SELECTOR) === surface,
      );
    let modelTrigger = uniqueModelTriggers[0] || null;
    let rowScope = surface;
    if (modelTrigger) {
      const activePanel = modelTrigger.closest("[data-active='true']");
      if (
        activePanel &&
        officialControlIsUsable(activePanel) &&
        activePanel.closest(PRIMARY_SURFACE_SELECTOR) === surface
      ) {
        if (activePanels.length !== 1 || activePanels[0] !== activePanel) {
          return null;
        }
        rowScope = activePanel;
      } else if (activePanels.length > 0) {
        return null;
      }
    } else {
      if (activePanels.length !== 1) return null;
      rowScope = activePanels[0];
    }
    let rowItems = officialItemsInSurface(surface).filter(
      (item) => rowScope === surface || rowScope.contains(item),
    );
    rowItems = officialItemsExcludingDaybreakProgram(surface, rowItems);
    if (!rowItems) return null;
    const modelIndex = modelTrigger ? rowItems.indexOf(modelTrigger) : -1;
    if (modelTrigger && modelIndex < 0) return null;
    const selectedEffortIndices = rowItems.flatMap((item, index) =>
      item.matches(OFFICIAL_SELECTED_EFFORT_SELECTOR) ||
          item.querySelector(OFFICIAL_SELECTED_EFFORT_SELECTOR)
        ? [index]
        : [],
    );
    const submenuIndices = rowItems.flatMap((item, index) =>
      item.matches(OFFICIAL_SUBMENU_TRIGGER_SELECTOR) ? [index] : [],
    );
    const effortExpectation = currentOfficialEffortExpectation(surface);
    const layout = officialAdvancedLayout(
      rowItems.length,
      modelIndex,
      selectedEffortIndices,
      submenuIndices,
      effortExpectation?.count ?? null,
      effortExpectation?.selectedIndex ?? null,
    );
    if (!layout) return null;
    modelTrigger = rowItems[layout.modelIndex] || null;
    if (!modelTrigger) return null;
    return {
      modelTrigger,
      effortTrigger: Number.isInteger(layout.effortIndex)
        ? rowItems[layout.effortIndex] || null
        : null,
      effortItems: Array.isArray(layout.effortIndices)
        ? layout.effortIndices.map((index) => rowItems[index]).filter(Boolean)
        : null,
      speedTrigger: rowItems[layout.speedIndex] || null,
      layoutKind: layout.kind,
    };
  }

  function officialAdvancedToggleTarget() {
    const trigger = findOfficialComposerTrigger();
    const surface = trigger ? findOfficialPrimarySurfaceForProxy(trigger) : null;
    if (!surface) return null;
    const rows = officialAdvancedRows(surface);
    if (rows) return { rows, surface };
    const toggles = [...surface.querySelectorAll(PRIMARY_CONTROL_SELECTOR)]
      .filter(
        (control) =>
          control.matches("[data-model-picker-view-toggle]") &&
          control.getAttribute("aria-expanded") !== "true" &&
          officialControlIsUsable(control) &&
          control.closest(PRIMARY_SURFACE_SELECTOR) === surface,
      );
    return toggles.length === 1
      ? { control: toggles[0], surface }
      : null;
  }

  async function ensureOfficialAdvancedRows(context) {
    if (context?.composerRoot) assertOfficialProxyContext(context);
    const primary = await ensureOfficialPrimaryOpen(context);
    const existingRows = officialAdvancedRows(primary.surface);
    if (existingRows) return { surface: primary.surface, rows: existingRows };

    const toggleTarget = await waitForOfficialState(
      officialAdvancedToggleTarget,
      "The official Advanced control stayed unavailable or ambiguous.",
      OFFICIAL_TRANSIENT_CONTROL_TIMEOUT_MS,
    );
    if (toggleTarget.rows) {
      state.primarySurface = toggleTarget.surface;
      return { surface: toggleTarget.surface, rows: toggleTarget.rows };
    }
    state.primarySurface = toggleTarget.surface;
    assertOfficialProxyContext(context);
    context.expandedAdvanced = true;
    context.advancedSourceSurface = toggleTarget.surface;
    clickOfficialControl(toggleTarget.control);
    const advanced = await waitForOfficialState(() => {
      const trigger = findOfficialComposerTrigger();
      const surface = trigger ? findOfficialPrimarySurfaceForProxy(trigger) : null;
      const rows = surface ? officialAdvancedRows(surface) : null;
      return surface && rows ? { surface, rows } : null;
    }, "The official Advanced model controls did not open.");
    assertOfficialProxyContext(context);
    state.primarySurface = advanced.surface;
    return advanced;
  }

  async function restoreOfficialPickerView(context) {
    if (!context.expandedAdvanced) return;
    if (context?.composerRoot && !officialProxyContextTrigger(context)) {
      context.expandedAdvanced = false;
      return;
    }
    const fallbackPrimary = context.advancedSourceSurface?.isConnected &&
        isVisible(context.advancedSourceSurface)
      ? { surface: context.advancedSourceSurface }
      : await ensureOfficialPrimaryOpen(context);
    const surface = fallbackPrimary.surface;
    const toggles = [...surface.querySelectorAll(PRIMARY_CONTROL_SELECTOR)]
      .filter(
        (control) =>
          control.matches("[data-model-picker-view-toggle]") &&
          officialControlIsUsable(control) &&
          control.closest(PRIMARY_SURFACE_SELECTOR) === surface,
      );
    if (toggles.length > 1) {
      throw new Error("Copicker could not restore the official compact picker view.");
    }
    if (toggles.length === 0) {
      context.expandedAdvanced = false;
      return;
    }
    if (toggles[0].getAttribute("aria-expanded") !== "true") {
      context.expandedAdvanced = false;
      return;
    }
    assertOfficialProxyContext(context);
    clickOfficialControl(toggles[0]);
    const compact = await waitForOfficialState(() => {
      const trigger = findOfficialComposerTrigger();
      const currentSurface = context.advancedSourceSurface?.isConnected
        ? context.advancedSourceSurface
        : trigger
          ? findOfficialPrimarySurfaceForProxy(trigger)
          : null;
      const currentToggle = currentSurface
        ? [...currentSurface.querySelectorAll(PRIMARY_CONTROL_SELECTOR)].find(
            (control) =>
              control.matches("[data-model-picker-view-toggle]") &&
              officialControlIsUsable(control) &&
              control.closest(PRIMARY_SURFACE_SELECTOR) === currentSurface,
          )
        : null;
      return trigger && currentSurface && currentToggle &&
          currentToggle.getAttribute("aria-expanded") !== "true"
        ? { trigger, surface: currentSurface }
        : null;
    }, "The official picker did not return to its original compact view.");
    assertOfficialProxyContext(context);
    context.expandedAdvanced = false;
    context.advancedSourceSurface = null;
    state.trigger = compact.trigger;
    state.primarySurface = compact.surface;
  }

  function findOfficialSubmenuSurface(trigger, primarySurface, predicate) {
    const controlledID = trigger?.getAttribute("aria-controls");
    if (controlledID) {
      const controlled = document.getElementById(controlledID);
      if (
        controlled &&
        controlled !== primarySurface &&
        isVisible(controlled) &&
        !primarySurface.contains(controlled) &&
        !controlled.contains(primarySurface) &&
        predicate(controlled)
      ) {
        return controlled;
      }
      return null;
    }

    const candidates = [...document.querySelectorAll(PRIMARY_SURFACE_SELECTOR)]
      .filter(
        (surface) =>
          surface !== primarySurface &&
          isVisible(surface) &&
          !primarySurface.contains(surface) &&
          !surface.contains(primarySurface) &&
          predicate(surface),
      );
    return candidates.length === 1 ? candidates[0] : null;
  }

  async function openOfficialSubmenu(
    trigger,
    primarySurface,
    predicate,
    failureMessage,
    context,
  ) {
    const existing = findOfficialSubmenuSurface(trigger, primarySurface, predicate);
    if (existing) return existing;
    if (context?.composerRoot) assertOfficialProxyContext(context);
    clickOfficialControl(trigger);
    const submenu = await waitForOfficialState(
      () => findOfficialSubmenuSurface(trigger, primarySurface, predicate),
      failureMessage,
    );
    if (context?.composerRoot) assertOfficialProxyContext(context);
    return submenu;
  }

  function officialModelItems(surface, catalogEntry) {
    if (!catalogEntry?.displayName) return [];
    return officialLeafItemsInSurface(surface).filter((item) =>
      officialElementMatchesModelLabels(item, [catalogEntry.displayName]),
    );
  }

  function officialSelectedLeafIndex(items) {
    const selectedIndices = items.flatMap((item, index) =>
      item.querySelector(OFFICIAL_CHECK_ICON_SELECTOR) ? [index] : [],
    );
    return selectedIndices.length === 1 ? selectedIndices[0] : null;
  }

  function officialLeafSemanticSignature(item) {
    if (!(item instanceof Element)) return "";
    const ariaLabel = String(item.getAttribute("aria-label") || "")
      .replace(/\s+/g, " ")
      .trim();
    if (ariaLabel) return `aria:${ariaLabel}`;
    const textValues = officialElementTextValues(item).filter(Boolean);
    return textValues.length > 0 ? `text:${textValues.join("\u001f")}` : "";
  }

  function officialSelectedModelCatalogEntry(surface) {
    if (!state.officialModelCatalog) return null;
    const items = officialLeafItemsInSurface(surface);
    const selectedIndex = officialSelectedLeafIndex(items);
    if (!Number.isInteger(selectedIndex) || !items[selectedIndex]) return null;
    const matches = state.officialModelCatalog.filter((entry) =>
      officialElementMatchesModelLabels(items[selectedIndex], [entry.displayName]),
    );
    return matches.length === 1 ? matches[0] : null;
  }

  async function currentOfficialCatalogEntryFromControls(context) {
    const { surface, rows } = await ensureOfficialAdvancedRows(context);
    if (!rows?.modelTrigger) {
      throw new Error("The official Model row is unavailable or ambiguous.");
    }
    const submenu = await openOfficialSubmenu(
      rows.modelTrigger,
      surface,
      (candidate) => Boolean(officialSelectedModelCatalogEntry(candidate)),
      "The official Model submenu did not expose one exact current model.",
      context,
    );
    const catalogEntry = officialSelectedModelCatalogEntry(submenu);
    if (!catalogEntry) {
      throw new Error("The current official model selection is ambiguous.");
    }
    return catalogEntry;
  }

  async function confirmOfficialModelSelection(catalogEntry, context) {
    const { surface, rows } = await ensureOfficialAdvancedRows(context);
    if (!rows?.modelTrigger) {
      throw new Error("The official Model row is unavailable for confirmation.");
    }
    const submenu = await openOfficialSubmenu(
      rows.modelTrigger,
      surface,
      (candidate) => officialModelItems(candidate, catalogEntry).length === 1,
      "The official Model submenu did not reopen for confirmation.",
      context,
    );
    await waitForOfficialState(() => {
      const items = officialLeafItemsInSurface(submenu);
      const matches = officialModelItems(submenu, catalogEntry);
      const selectedIndex = officialSelectedLeafIndex(items);
      return matches.length === 1 &&
          Number.isInteger(selectedIndex) &&
          items[selectedIndex] === matches[0]
        ? matches[0]
        : null;
    }, "Codex did not mark the selected model through its official control.");
    return {
      kind: "selected-model-leaf",
      model: catalogEntry.model,
      rowIndex: catalogEntry.rowIndex,
    };
  }

  async function resolveOfficialModelTarget(catalogEntry, context) {
    const { surface, rows } = await ensureOfficialAdvancedRows(context);
    if (!rows?.modelTrigger) {
      throw new Error("The official Model row is unavailable or ambiguous.");
    }
    const submenu = await openOfficialSubmenu(
      rows.modelTrigger,
      surface,
      (candidate) => officialModelItems(candidate, catalogEntry).length === 1,
      "The official Model submenu did not expose one exact target model.",
      context,
    );
    const matches = officialModelItems(submenu, catalogEntry);
    if (matches.length !== 1) {
      throw new Error("The official target model control is unavailable or ambiguous.");
    }
    return matches[0];
  }

  async function assertOfficialDaybreakSelectionPolicyReady(
    selection,
    context,
  ) {
    const trigger = assertOfficialProxyContext(context);
    const surface = findOfficialPrimarySurfaceForProxy(trigger);
    if (modelListSnapshot(surface, trigger) && !officialDaybreakProgramState(surface).present) {
      context.expectedDaybreakState = { kind: "model-list" };
      return;
    }
    const advanced = await ensureOfficialAdvancedRows(context);
    const initialProgram = officialDaybreakProgramState(advanced.surface);
    if (initialProgram.present) {
      assertOfficialDaybreakSelectionPolicy(selection, advanced.surface);
      context.expectedDaybreakState = { kind: "program-off" };
      state.daybreakClassification = {
        composerRoot: context.composerRoot,
        kind: "program-off",
        structureGeneration: state.officialStructureMutationGeneration,
        programGeneration: state.officialDaybreakProgramMutationGeneration,
      };
      return;
    }

    const daybreakRow = ALL_ROWS.find((row) => row.id === "daybreak-blue");
    const rawEntries = state.officialModelCatalog?.filter((entry) =>
      rowMatchesDisplayName(daybreakRow, entry?.displayName)
    ) || [];
    if (rawEntries.length !== 1 || !advanced.rows?.modelTrigger) {
      throw new Error("The Codex Daybreak program state is ambiguous.");
    }

    const submenu = await openOfficialSubmenu(
      advanced.rows.modelTrigger,
      advanced.surface,
      (candidate) => officialLeafItemsInSurface(candidate).length > 0,
      "The official Model submenu did not open for Daybreak classification.",
      context,
    );
    const currentProgram = officialDaybreakProgramState(advanced.surface);
    if (currentProgram.present) {
      assertOfficialDaybreakSelectionPolicy(selection, advanced.surface);
      context.expectedDaybreakState = { kind: "program-off" };
      state.daybreakClassification = {
        composerRoot: context.composerRoot,
        kind: "program-off",
        structureGeneration: state.officialStructureMutationGeneration,
        programGeneration: state.officialDaybreakProgramMutationGeneration,
      };
      return;
    }
    if (officialModelItems(submenu, rawEntries[0]).length !== 1) {
      throw new Error(
        "The Codex Daybreak program is loading or lacks an explicit base-model policy.",
      );
    }
    context.expectedDaybreakState = {
      kind: "legacy-model",
      structureGeneration: state.officialStructureMutationGeneration,
      programGeneration: state.officialDaybreakProgramMutationGeneration,
    };
    state.daybreakClassification = {
      composerRoot: context.composerRoot,
      kind: "legacy-model",
      structureGeneration: state.officialStructureMutationGeneration,
      programGeneration: state.officialDaybreakProgramMutationGeneration,
    };
  }

  function assertOfficialDaybreakStateUnchanged(context) {
    const expected = context?.expectedDaybreakState;
    if (!expected) return;
    const trigger = assertOfficialProxyContext(context);
    const surface = findOfficialPrimarySurfaceForProxy(trigger);
    const current = officialDaybreakProgramState(surface);
    const unchanged = expected.kind === "program-off"
      ? current.present && current.checked === false
      : expected.kind === "model-list"
        ? Boolean(modelListSnapshot(surface, trigger)) && !current.present
      : expected.kind === "legacy-model"
        ? !current.present &&
          expected.programGeneration ===
            state.officialDaybreakProgramMutationGeneration
        : false;
    if (!unchanged) {
      const error = new Error(
        "The Codex Daybreak program state changed during selection.",
      );
      error.externalOfficialStateChanged = true;
      throw error;
    }
  }

  async function selectOfficialModel(catalogEntry, context, options) {
    const currentTrigger = findOfficialComposerTrigger();
    if (
      currentTrigger &&
      officialElementMatchesModelLabels(currentTrigger, [catalogEntry.displayName])
    ) {
      return;
    }

    const target = await resolveOfficialModelTarget(catalogEntry, context);
    assertOfficialProxyContext(context);
    beforeOfficialSettingMutation(context, options, {
      modelSurface: target.closest(PRIMARY_SURFACE_SELECTOR),
    });
    clickOfficialControl(target);
    const confirmation = await confirmOfficialModelSelection(catalogEntry, context);
    state.trigger = findOfficialComposerTrigger();
    return confirmation;
  }

  async function resolveOfficialEffortTarget(effort, catalogEntry, context) {
    const { surface, rows } = await ensureOfficialAdvancedRows(context);
    const effortOrder = catalogEntry.supportedEffortOrder;
    let items = rows?.effortItems;
    if (!items) {
      if (!rows?.effortTrigger) {
        throw new Error("The official Effort row is unavailable or ambiguous.");
      }
      const submenu = await openOfficialSubmenu(
        rows.effortTrigger,
        surface,
        (candidate) =>
          officialLeafItemsInSurface(candidate).length === effortOrder.length &&
          (
            rows.layoutKind === "power-submenus" ||
            Boolean(candidate.querySelector(OFFICIAL_SELECTED_EFFORT_SELECTOR))
        ),
        "The official Effort submenu did not open.",
        context,
      );
      items = officialLeafItemsInSurface(submenu);
    }
    if (items.length !== effortOrder.length) {
      throw new Error("The official Effort menu no longer matches the model catalog.");
    }
    const targetIndex = effortOrder.indexOf(effort);
    if (targetIndex < 0 || !items[targetIndex]) {
      throw new Error("The selected effort has no exact official control.");
    }
    return items[targetIndex];
  }

  async function selectOfficialEffort(effort, catalogEntry, context, options) {
    const currentTrigger = findOfficialComposerTrigger();
    if (currentTrigger?.getAttribute("data-selected-reasoning-effort") === effort) return;

    const target = await resolveOfficialEffortTarget(
      effort,
      catalogEntry,
      context,
    );
    assertOfficialProxyContext(context);
    beforeOfficialSettingMutation(context, options);
    clickOfficialControl(target);
    const trigger = await waitForOfficialState(() => {
      const candidate = findOfficialComposerTrigger();
      return candidate?.getAttribute("data-selected-reasoning-effort") === effort
        ? candidate
        : null;
    }, "Codex did not confirm the effort selected through its official control.");
    state.trigger = trigger;
  }

  async function officialServiceTierItems(
    catalogEntry,
    context,
    failureMessage,
  ) {
    const advanced = await ensureOfficialAdvancedRows(context);
    if (!advanced.rows?.speedTrigger) {
      throw new Error("The official Speed row is unavailable or ambiguous.");
    }
    const expectedCount = catalogEntry?.serviceTierOptionCount;
    if (!Number.isInteger(expectedCount) || expectedCount < 1) {
      throw new Error("The official Speed catalog is unavailable or ambiguous.");
    }
    const submenu = await openOfficialSubmenu(
      advanced.rows.speedTrigger,
      advanced.surface,
      (candidate) => {
        if (candidate.querySelector(OFFICIAL_SELECTED_EFFORT_SELECTOR)) return false;
        return officialLeafItemsInSurface(candidate).length === expectedCount;
      },
      failureMessage,
      context,
    );
    const items = officialLeafItemsInSurface(submenu);
    if (items.length !== expectedCount) {
      throw new Error("The official Speed menu no longer matches the model catalog.");
    }
    const selectedIndex = officialSelectedLeafIndex(items);
    const selectedLeafSignature = Number.isInteger(selectedIndex)
      ? officialLeafSemanticSignature(items[selectedIndex])
      : "";
    if (!selectedLeafSignature) {
      throw new Error("The official Speed selection lacks an exact semantic signature.");
    }
    return { items, submenu, selectedIndex, selectedLeafSignature };
  }

  async function readOfficialSelectionBaselineSnapshot(context) {
    const catalogEntry = await currentOfficialCatalogEntryFromControls(context);
    if (!catalogEntry || catalogEntry.hidden) {
      throw new Error(
        "The current official model cannot be restored through one selectable Model leaf.",
      );
    }
    const trigger = findOfficialComposerTrigger();
    const effort = trigger?.getAttribute("data-selected-reasoning-effort") || "";
    if (!catalogEntry.supportedEffortOrder.includes(effort)) {
      throw new Error("The current official effort cannot be restored exactly.");
    }
    await resolveOfficialModelTarget(catalogEntry, context);
    await resolveOfficialEffortTarget(effort, catalogEntry, context);
    const speed = await officialServiceTierItems(
      catalogEntry,
      context,
      "The current official Speed submenu did not open for rollback capture.",
    );
    const serviceTierOptionIndex = speed.selectedIndex;
    if (!Number.isInteger(serviceTierOptionIndex)) {
      throw new Error("The current official Speed tier cannot be restored exactly.");
    }
    const verifiedCatalogEntry = await currentOfficialCatalogEntryFromControls(context);
    const verifiedTrigger = assertOfficialProxyContext(context);
    const verifiedEffort =
      verifiedTrigger.getAttribute("data-selected-reasoning-effort") || "";
    const verifiedSpeed = await officialServiceTierItems(
      catalogEntry,
      context,
      "The current official Speed submenu did not reopen for rollback verification.",
    );
    if (
      verifiedCatalogEntry.model !== catalogEntry.model ||
      verifiedEffort !== effort ||
      verifiedSpeed.items.length !== speed.items.length ||
      verifiedSpeed.selectedIndex !== serviceTierOptionIndex ||
      verifiedSpeed.selectedLeafSignature !== speed.selectedLeafSignature
    ) {
      throw new Error("The current official selection changed during capture.");
    }
    return {
      catalogEntry,
      effort,
      serviceTierOptionIndex,
      serviceTierOptionCount: speed.items.length,
      serviceTierLeafSignature: speed.selectedLeafSignature,
    };
  }

  async function captureOfficialSelectionBaseline(
    context,
    { requireRestorableStandard = true } = {},
  ) {
    const first = await readOfficialSelectionBaselineSnapshot(context);
    const second = await readOfficialSelectionBaselineSnapshot(context);
    if (
      second.catalogEntry.model !== first.catalogEntry.model ||
      second.effort !== first.effort ||
      second.serviceTierOptionIndex !== first.serviceTierOptionIndex ||
      second.serviceTierOptionCount !== first.serviceTierOptionCount ||
      second.serviceTierLeafSignature !== first.serviceTierLeafSignature
    ) {
      throw new Error("The current official selection changed during capture.");
    }
    if (
      requireRestorableStandard &&
      second.serviceTierOptionIndex === 0 &&
      !officialServiceTierTransitionPlan(
        0,
        0,
        second.serviceTierOptionCount,
        second.catalogEntry.fastTierOptionIndex,
      )
    ) {
      throw new Error(
        "The current Standard tier cannot be normalized through a Fast transition.",
      );
    }
    return {
      ...second,
      requiresStandardNormalization: second.serviceTierOptionIndex === 0,
    };
  }

  function coPickerSelectionFromOfficialBaseline(baseline) {
    const catalogEntry = state.modelCatalog?.find(
      (entry) => entry?.model === baseline?.catalogEntry?.model,
    );
    if (!catalogEntry) return null;
    const row = ROWS[catalogEntry.rowIndex];
    const effortIndex = EFFORTS.indexOf(baseline.effort);
    if (!row?.dots.includes(effortIndex + 1)) return null;
    const fastMode = baseline.serviceTierOptionIndex === 0
      ? false
      : row.supportsFast &&
          baseline.serviceTierOptionIndex === catalogEntry.fastTierOptionIndex
        ? true
        : null;
    if (fastMode === null) return null;
    return {
      rowIndex: catalogEntry.rowIndex,
      indexInRow: effortIndex,
      modelName: row.name,
      effort: baseline.effort,
      fastMode,
    };
  }

  function assertOfficialFirstMutationBaseline(context, evidence = {}) {
    const expected = context?.expectedSelectionBeforeFirstMutation;
    if (!expected || context.firstForwardMutationValidated) return;

    const trigger = assertOfficialProxyContext(context);
    const primarySurface = findOfficialPrimarySurfaceForProxy(trigger);
    const rows = primarySurface ? officialAdvancedRows(primarySurface) : null;
    const modelSurface = evidence.modelSurface;
    const selectedModel = modelSurface
      ? officialSelectedModelCatalogEntry(modelSurface)
      : null;
    const modelMatches = selectedModel
      ? selectedModel.model === expected.catalogEntry.model
      : Boolean(
          rows?.modelTrigger &&
          officialElementMatchesModelLabels(
            rows.modelTrigger,
            [expected.catalogEntry.displayName],
          )
        );
    const effort = trigger.getAttribute("data-selected-reasoning-effort") || "";
    if (
      !modelMatches ||
      effort !== expected.effort
    ) {
      throw new Error(
        "The current official model, effort, or Speed state changed before the first setting mutation.",
      );
    }

    if (Array.isArray(evidence.serviceTierItems)) {
      const connectedItems = evidence.serviceTierItems.filter(
        (item) => item?.isConnected,
      );
      if (
        connectedItems.length !== expected.serviceTierOptionCount ||
        officialSelectedLeafIndex(connectedItems) !==
          expected.serviceTierOptionIndex ||
        officialLeafSemanticSignature(
          connectedItems[expected.serviceTierOptionIndex],
        ) !== expected.serviceTierLeafSignature
      ) {
        throw new Error(
          "The current official Speed tier changed before the first setting mutation.",
        );
      }
    } else if (
      expected.serviceTierOptionIndex !==
        expected.catalogEntry.fastTierOptionIndex ||
      readOfficialFastMode(primarySurface) !== true
    ) {
      throw new Error(
        "The complete official Speed tier could not be revalidated before the first setting mutation.",
      );
    }
    context.firstForwardMutationValidated = true;
  }

  function beforeOfficialSettingMutation(context, options, evidence) {
    if (context?.intent) assertSelectionIntent(context.intent);
    assertOfficialDaybreakStateUnchanged(context);
    assertOfficialFirstMutationBaseline(context, evidence);
    options?.onBeforeMutation?.();
  }

  async function selectOfficialServiceTierIndex(
    targetIndex,
    catalogEntry,
    context,
    options,
  ) {
    const initial = await officialServiceTierItems(
      catalogEntry,
      context,
      "The official Speed submenu did not open.",
    );
    const selectedIndex = initial.selectedIndex;
    if (
      options?.expectedTargetLeafSignature &&
      (
        initial.items.length !== options.expectedOptionCount ||
        officialLeafSemanticSignature(initial.items[targetIndex]) !==
          options.expectedTargetLeafSignature
      )
    ) {
      throw new Error(
        "The saved Speed tier no longer maps to the same official control.",
      );
    }
    const transitionPlan = officialServiceTierTransitionPlan(
      targetIndex,
      selectedIndex,
      initial.items.length,
      catalogEntry?.fastTierOptionIndex,
    );
    if (!transitionPlan) {
      throw new Error("The selected speed tier has no exact official control.");
    }
    let kind = "selected-leaf";
    for (const [position, stepIndex] of transitionPlan.entries()) {
      const current = position === 0
        ? initial
        : await officialServiceTierItems(
            catalogEntry,
            context,
            "The official Speed submenu did not reopen between tier transitions.",
          );
      if (!current.items[stepIndex]) {
        throw new Error("The selected speed tier transition became unavailable.");
      }
      if (
        options?.expectedTargetLeafSignature &&
        stepIndex === targetIndex &&
        (
          current.items.length !== options.expectedOptionCount ||
          officialLeafSemanticSignature(current.items[stepIndex]) !==
            options.expectedTargetLeafSignature
        )
      ) {
        throw new Error(
          "The saved Speed tier no longer maps to the same official control.",
        );
      }
      const targetLeafSignature = officialLeafSemanticSignature(
        current.items[stepIndex],
      );
      if (!targetLeafSignature) {
        throw new Error("The selected speed tier lacks an exact semantic signature.");
      }
      assertOfficialProxyContext(context);
      beforeOfficialSettingMutation(context, options, {
        serviceTierItems: current.items,
      });
      clickOfficialControl(current.items[stepIndex]);

      const reopened = await ensureOfficialPrimaryOpen(context);
      if (
        stepIndex === catalogEntry?.fastTierOptionIndex &&
        readOfficialFastMode(reopened.surface) === true
      ) {
        kind = "checkbox";
        continue;
      }

      const confirmation = await officialServiceTierItems(
        catalogEntry,
        context,
        "The official Speed submenu did not reopen for confirmation.",
      );
      await waitForOfficialState(
        () => {
          const currentItems = officialLeafItemsInSurface(confirmation.submenu);
          return currentItems.length === catalogEntry.serviceTierOptionCount &&
            officialSelectedLeafIndex(currentItems) === stepIndex &&
            officialLeafSemanticSignature(currentItems[stepIndex]) ===
              targetLeafSignature;
        },
        "Codex did not mark the selected speed through its official control.",
      );
      kind = "selected-leaf";
    }
    return kind;
  }

  async function selectOfficialFastMode(enabled, catalogEntry, context, options) {
    assertOfficialProxyContext(context);
    const primary = await ensureOfficialPrimaryOpen(context);
    const surface = primary.surface;
    if (officialSpeedConfirmationSource(
      enabled,
      readOfficialFastMode(surface),
      null,
      null,
    ) === "checkbox") {
      return { kind: "checkbox", enabled };
    }
    const targetIndex = enabled ? catalogEntry?.fastTierOptionIndex : 0;
    const kind = await selectOfficialServiceTierIndex(
      targetIndex,
      catalogEntry,
      context,
      options,
    );
    return { kind, enabled };
  }

  async function restoreOfficialSelectionBaseline(baseline, context) {
    await selectOfficialModel(baseline.catalogEntry, context);
    await selectOfficialEffort(
      baseline.effort,
      baseline.catalogEntry,
      context,
    );
    await selectOfficialServiceTierIndex(
      baseline.serviceTierOptionIndex,
      baseline.catalogEntry,
      context,
      {
        expectedOptionCount: baseline.serviceTierOptionCount,
        expectedTargetLeafSignature: baseline.serviceTierLeafSignature,
      },
    );
    await confirmOfficialModelSelection(baseline.catalogEntry, context);
    const restored = await captureOfficialSelectionBaseline(context);
    if (
      restored.catalogEntry.model !== baseline.catalogEntry.model ||
      restored.effort !== baseline.effort ||
      restored.serviceTierOptionIndex !== baseline.serviceTierOptionIndex ||
      restored.serviceTierOptionCount !== baseline.serviceTierOptionCount ||
      restored.serviceTierLeafSignature !== baseline.serviceTierLeafSignature
    ) {
      throw new Error("Codex did not restore the complete official selection.");
    }
  }

  async function verifyCurrentOfficialSelection(
    selection,
    intent,
  ) {
    const modern = modelListSnapshot(state.primarySurface);
    if (modern) {
      assertSelectionIntent(intent);
      return modern.fastMode !== null &&
        selectionsEqual(selectionFromModelListSnapshot(modern), selection);
    }
    const context = {
      composerRoot: intent?.composerRoot || null,
      expandedAdvanced: false,
      interruptedByUserInput: false,
      intent,
    };
    let removeInputGuard = null;
    let confirmed = false;
    let confirmedEpoch = null;
    try {
      assertSelectionIntent(intent);
      removeInputGuard = installOfficialProxyInputGuard(context);
      await ensureOfficialPrimaryOpen(context);
      assertSelectionIntent(intent);
      assertOfficialProxyContext(context);
      await assertOfficialDaybreakSelectionPolicyReady(selection, context);
      const baseline = await captureOfficialSelectionBaseline(context, {
        requireRestorableStandard: false,
      });
      assertOfficialDaybreakStateUnchanged(context);
      const current = coPickerSelectionFromOfficialBaseline(baseline);
      assertOfficialProxyContext(context);
      confirmed = Boolean(selection.fastMode && selectionsEqual(current, selection));
      confirmedEpoch = state.officialInteractionEpoch;
    } finally {
      try {
        await restoreOfficialPickerView(context);
      } finally {
        removeInputGuard?.();
      }
    }
    assertSelectionIntent(intent);
    assertOfficialProxyContext(context);
    assertOfficialDaybreakStateUnchanged(context);
    if (confirmedEpoch !== state.officialInteractionEpoch) {
      throw new Error("The official selection changed during verification.");
    }
    return confirmed;
  }

  async function performOfficialControlProxy(selection, catalogEntry, intent) {
    if (modelListRoot(state.primarySurface)) {
      return performModelListControlProxy(selection, catalogEntry, intent);
    }
    const row = ROWS[selection.rowIndex];
    const context = {
      composerRoot: intent?.composerRoot || null,
      expandedAdvanced: false,
      interruptedByUserInput: false,
      intent,
    };
    let rollbackBaseline = null;
    let normalizedBaselineStandard = false;
    let mutationStarted = false;
    let removeInputGuard = null;
    try {
      assertSelectionIntent(intent);
      removeInputGuard = installOfficialProxyInputGuard(context);
      const initial = await ensureOfficialPrimaryOpen(context);
      assertSelectionIntent(intent);
      assertOfficialProxyContext(context);
      assertOfficialDaybreakSelectionPolicy(selection, initial.surface);
      await assertOfficialDaybreakSelectionPolicyReady(selection, context);
      await resolveOfficialModelTarget(catalogEntry, context);
      rollbackBaseline = await captureOfficialSelectionBaseline(context);
      context.expectedSelectionBeforeFirstMutation = rollbackBaseline;
      const forwardMutationOptions = {
        onBeforeMutation: () => {
          mutationStarted = true;
        },
      };
      if (rollbackBaseline.requiresStandardNormalization) {
        const kind = await selectOfficialServiceTierIndex(
          0,
          rollbackBaseline.catalogEntry,
          context,
          forwardMutationOptions,
        );
        normalizedBaselineStandard = Boolean(kind);
      }
      if (!row.supportsFast) {
        const currentCatalogEntry = rollbackBaseline.catalogEntry;
        if (!currentCatalogEntry) {
          throw new Error(
            "The current official model is unavailable for exact Speed clearing.",
          );
        }
        if (!normalizedBaselineStandard) {
          await selectOfficialFastMode(
            false,
            currentCatalogEntry,
            context,
            forwardMutationOptions,
          );
        }
      }

      if (row.supportsFast && !normalizedBaselineStandard) {
        await selectOfficialFastMode(
          Boolean(selection.fastMode),
          rollbackBaseline.catalogEntry,
          context,
          forwardMutationOptions,
        );
      }

      await selectOfficialModel(
        catalogEntry,
        context,
        forwardMutationOptions,
      );
      await selectOfficialEffort(
        selection.effort,
        catalogEntry,
        context,
        forwardMutationOptions,
      );
      if (row.supportsFast) {
        await selectOfficialFastMode(
          Boolean(selection.fastMode),
          catalogEntry,
          context,
          forwardMutationOptions,
        );
      }

      await confirmOfficialModelSelection(
        catalogEntry,
        context,
      );

      assertOfficialDaybreakStateUnchanged(context);
      const finalBaseline = await captureOfficialSelectionBaseline(context, {
        requireRestorableStandard: false,
      });
      assertOfficialDaybreakStateUnchanged(context);
      const confirmed = coPickerSelectionFromOfficialBaseline(finalBaseline);
      const finalMutationGeneration =
        state.officialSelectionMutationGeneration;
      await restoreOfficialPickerView(context);
      await ensureOfficialPrimaryOpen(context);
      assertSelectionIntent(intent);
      assertOfficialProxyContext(context);
      if (
        finalMutationGeneration !==
          state.officialSelectionMutationGeneration
      ) {
        const error = new Error(
          "The official selection changed after final confirmation.",
        );
        error.externalOfficialStateChanged = true;
        throw error;
      }
      assertOfficialDaybreakStateUnchanged(context);
      if (!selectionsEqual(confirmed, selection)) {
        throw new Error("The official controls did not confirm the complete CoPicker selection.");
      }
      return confirmed;
    } catch (error) {
      let rollbackError = null;
      const officialMutationStarted = mutationStarted;
      if (
        officialMutationStarted &&
        rollbackBaseline &&
        !(error instanceof Error && error.externalOfficialStateChanged)
      ) {
        try {
          await restoreOfficialSelectionBaseline(rollbackBaseline, context);
        } catch (failure) {
          rollbackError = failure;
        }
      } else if (officialMutationStarted) {
        rollbackError = new Error(
          error instanceof Error && error.externalOfficialStateChanged
            ? "Rollback was suppressed after an external Daybreak state change."
            : "The official tier normalization failed before a rollback baseline was complete.",
        );
      }
      try {
        await restoreOfficialPickerView(context);
      } catch (restoreError) {
        if (error instanceof Error) error.restoreError = restoreError;
      }
      if (rollbackError && error instanceof Error) {
        error.rollbackError = rollbackError;
      }
      if (error instanceof Error && officialMutationStarted) {
        error.officialRollbackStatus = rollbackError
          ? "failed"
          : rollbackBaseline?.requiresStandardNormalization
            ? "restored-normalized"
            : "restored";
        error.rollbackSelection = rollbackError
          ? null
          : coPickerSelectionFromOfficialBaseline(rollbackBaseline);
      }
      throw error;
    } finally {
      removeInputGuard?.();
    }
  }

  async function performNoThreadSelectionCommit(
    selection,
    revision,
    catalogEntry,
    intent,
    { force = false, railBaseline = null } = {},
  ) {
    const previousConfirmed = state.confirmedSelection;
    const sameAsConfirmed = state.confirmedThreadID === null &&
      selectionsEqual(previousConfirmed, selection);
    if (shouldVerifyUnchangedNoTaskSelection(
      sameAsConfirmed,
      force,
      selection.fastMode,
    )) {
      if (await verifyCurrentOfficialSelection(selection, intent)) {
        setSwitchState("confirmed");
        return {
          confirmed: true,
          unchanged: true,
          mode: "official-control-proxy",
        };
      }
    }

    state.commitInFlight = true;
    state.commitThreadID = null;
    state.pendingOfficialSelection = { ...selection };
    setSwitchState("pending");
    try {
      const confirmed = await performOfficialControlProxy(
        selection,
        catalogEntry,
        intent,
      );
      assertSelectionIntent(intent);
      state.confirmedSelection = confirmed;
      state.confirmedThreadID = null;
      state.officialSelectionDirty = false;
      state.lastSwitchError = null;
      setSwitchState("confirmed");
      return {
        confirmed: true,
        unchanged: sameAsConfirmed,
        superseded: revision < state.selectionRevision,
        mode: "official-control-proxy",
      };
    } catch (error) {
      if (error instanceof Error) error.selectionUIHandled = true;
      const intentCurrent = selectionIntentIsCurrent(intent);
      if (intentCurrent) state.lastSwitchError = error;
      const rollbackSelection = error instanceof Error
        ? error.rollbackSelection
        : null;
      const rollbackStatus = error instanceof Error
        ? error.officialRollbackStatus
        : null;
      if (rollbackStatus) {
        if (intentCurrent) {
          state.confirmedSelection = rollbackSelection || null;
          state.confirmedThreadID = null;
        }
        if (
          revision === state.selectionRevision &&
          intentCurrent
        ) {
          applySelection(rollbackSelection || {
            rowIndex: null,
            indexInRow: null,
            modelName: "Other",
            effort: null,
            fastMode: false,
          });
        }
      } else if (
        revision === state.selectionRevision &&
        intentCurrent
      ) {
        applySelection(railBaseline || previousConfirmed || {
          rowIndex: null,
          indexInRow: null,
          modelName: "Other",
          effort: null,
          fastMode: false,
        });
      }
      if (intentCurrent) setSwitchState("error");
      throw error;
    } finally {
      state.pendingOfficialSelection = null;
      state.commitInFlight = false;
      state.commitThreadID = null;
      scheduleSync();
    }
  }

  async function performSelectionCommitBound(
    selection,
    revision,
    { force = false, railBaseline = null } = {},
    intent,
  ) {
    if (!Number.isInteger(selection?.rowIndex) || !selection.effort) {
      throw new Error("A supported model and effort must be selected.");
    }
    if (revision < state.selectionRevision) return { skipped: "superseded" };
    assertSelectionIntent(intent);

    const catalog = await ensureModelCatalog();
    const catalogEntry = catalog[selection.rowIndex];
    if (!catalogEntry?.supportedEfforts.has(selection.effort)) {
      throw new Error("The selected model or effort is unavailable.");
    }
    if (selection.fastMode && !catalogEntry.fastTierID) {
      throw new Error("Fast is unavailable for the selected model.");
    }
    if (revision < state.selectionRevision) return { skipped: "superseded" };
    const commitTrigger = assertSelectionIntent(intent);

    const threadID = resolveCurrentThreadID(commitTrigger);
    state.trigger = commitTrigger;
    state.currentThreadID = threadID;
    const commitSurface = findPrimarySurface(commitTrigger);
    assertOfficialDaybreakSelectionPolicy(selection, commitSurface);
    if (!threadID) {
      return performNoThreadSelectionCommit(
        selection,
        revision,
        catalogEntry,
        intent,
        { force, railBaseline },
      );
    }
    const previousConfirmed = state.confirmedSelection;
    const sameAsConfirmed = state.confirmedThreadID === threadID &&
      selectionsEqual(previousConfirmed, selection);
    const currentDaybreakProgram = officialDaybreakProgramState(commitSurface);
    if (shouldReuseThreadSelectionConfirmation(
      sameAsConfirmed,
      force,
      currentDaybreakProgram.present,
      currentDaybreakProgram.checked,
    )) {
      setSwitchState("confirmed");
      return { confirmed: true, unchanged: true };
    }

    const notificationGenerationAtStart =
      state.latestThreadSettings.get(threadID)?.generation || 0;
    const railSelectionGenerationAtStart = state.railSelectionGeneration;
    let confirmation = null;
    let requestDispatched = false;
    let suppressFinalNotificationReplay = false;
    state.commitInFlight = true;
    state.commitThreadID = threadID;
    setSwitchState("pending");
    const directContext = {
      composerRoot: intent.composerRoot,
      threadID,
      expandedAdvanced: false,
      interruptedByUserInput: false,
    };
    let removeInputGuard = null;
    try {
      const currentTrigger = assertSelectionIntent(intent);
      assertOfficialDaybreakSelectionPolicy(
        selection,
        findPrimarySurface(currentTrigger),
      );
      removeInputGuard = installOfficialProxyInputGuard(directContext);
      await assertOfficialDaybreakSelectionPolicyReady(
        selection,
        directContext,
      );
      assertSelectionIntent(intent);
      assertOfficialDaybreakStateUnchanged(directContext);
      assertOfficialProxyContext(directContext);
      if (
        (state.latestThreadSettings.get(threadID)?.generation || 0) !==
          notificationGenerationAtStart
      ) {
        throw new Error(
          "A newer official thread-settings notification superseded this update before it was sent.",
        );
      }
      confirmation = createSettingsWaiter(
        threadID,
        selection,
        notificationGenerationAtStart,
      );
      requestDispatched = true;
      await sendAppServerRequest("thread/settings/update", {
        threadId: threadID,
        model: catalogEntry.model,
        effort: selection.effort,
        serviceTier: selection.fastMode ? catalogEntry.fastTierID : null,
      });

      const confirmationResult = await confirmation.promise;
      const latestNotification = state.latestThreadSettings.get(threadID);
      if (
        !latestNotification ||
        confirmationResult.generation <= notificationGenerationAtStart ||
        latestNotification.generation !== confirmationResult.generation ||
        !selectionsEqual(latestNotification.selection, selection)
      ) {
        throw new Error(
          "A newer official thread-settings notification superseded this update.",
        );
      }

      assertSelectionIntent(intent);
      assertOfficialProxyContext(directContext);
      assertOfficialDaybreakStateUnchanged(directContext);
      await restoreOfficialPickerView(directContext);
      const finalNotification = state.latestThreadSettings.get(threadID);
      if (
        !finalNotification ||
        finalNotification.generation !== confirmationResult.generation ||
        !selectionsEqual(finalNotification.selection, selection)
      ) {
        throw new Error(
          "A newer official thread-settings notification superseded this update.",
        );
      }
      assertSelectionIntent(intent);
      assertOfficialProxyContext(directContext);
      assertOfficialDaybreakStateUnchanged(directContext);
      state.confirmedSelection = { ...selection };
      state.confirmedThreadID = threadID;
      state.lastSwitchError = null;
      setSwitchState("confirmed");
      return { confirmed: true, unchanged: sameAsConfirmed };
    } catch (error) {
      if (error instanceof Error) error.selectionUIHandled = true;
      suppressFinalNotificationReplay =
        directContext.interruptedByUserInput ||
        Boolean(error instanceof Error && error.externalOfficialStateChanged);
      confirmation?.cancel();
      const intentCurrent = selectionIntentIsCurrent(intent);
      if (intentCurrent) state.lastSwitchError = error;
      const latestNotification = state.latestThreadSettings.get(threadID);
      const hasNewerAuthoritativeNotification =
        latestNotification?.generation > notificationGenerationAtStart;
      const hasUnconfirmedDispatchedUpdate =
        requestDispatched && !hasNewerAuthoritativeNotification;
      if (hasUnconfirmedDispatchedUpdate) {
        state.latestThreadSettings.delete(threadID);
      }
      const canAdoptAuthoritativeSelection =
        !(error instanceof Error && error.externalOfficialStateChanged);
      const authoritativeSelection =
        hasNewerAuthoritativeNotification && canAdoptAuthoritativeSelection
        ? latestNotification.selection
        : null;
      const fallbackSelection = hasNewerAuthoritativeNotification
        ? authoritativeSelection || {
            rowIndex: null,
            indexInRow: null,
            modelName: "Other",
            effort: null,
            fastMode: false,
          }
        : hasUnconfirmedDispatchedUpdate
          ? {
              rowIndex: null,
              indexInRow: null,
              modelName: "Other",
              effort: null,
              fastMode: false,
            }
          : railBaseline || previousConfirmed || {
            rowIndex: null,
            indexInRow: null,
            modelName: "Other",
            effort: null,
            fastMode: false,
          };
      if (
        revision === state.selectionRevision &&
        intentCurrent
      ) {
        applySelection(fallbackSelection);
      }
      if (intentCurrent) {
        if (authoritativeSelection) {
          state.confirmedSelection = authoritativeSelection;
          state.confirmedThreadID = threadID;
          setSwitchState("confirmed");
        } else {
          if (
            hasNewerAuthoritativeNotification ||
            hasUnconfirmedDispatchedUpdate
          ) {
            state.confirmedSelection = null;
            state.confirmedThreadID = null;
          }
          setSwitchState("error");
        }
      }
      throw error;
    } finally {
      confirmation?.cancel();
      try {
        await restoreOfficialPickerView(directContext);
      } catch (_) {}
      removeInputGuard?.();
      state.commitInFlight = false;
      state.commitThreadID = null;
      const latestNotification = state.latestThreadSettings.get(threadID);
      const liveTrigger = findOfficialComposerTrigger();
      const liveComposerRoot =
        liveTrigger?.closest("[data-codex-composer-root]") || null;
      if (
        !suppressFinalNotificationReplay &&
        !directContext.interruptedByUserInput &&
        selectionIntentIsCurrent(intent) &&
        latestNotification?.generation > notificationGenerationAtStart &&
        latestNotification.reconciled !== true &&
        state.railSelectionGeneration === railSelectionGenerationAtStart &&
        liveComposerRoot === intent.composerRoot &&
        resolveCurrentThreadID(liveTrigger) === threadID
      ) {
        reconcileSettingsNotification(
          threadID,
          latestNotification.generation,
        );
      }
      scheduleSync();
    }
  }

  async function performSelectionCommit(selection, revision, options, intent) {
    try {
      return await performSelectionCommitBound(
        selection,
        revision,
        options,
        intent,
      );
    } catch (error) {
      if (!(error instanceof Error && error.selectionUIHandled)) {
        state.lastSwitchError = error;
        if (
          revision === state.selectionRevision &&
          selectionIntentIsCurrent(intent)
        ) {
          applySelection(options?.railBaseline || state.confirmedSelection || {
            rowIndex: null,
            indexInRow: null,
            modelName: "Other",
            effort: null,
            fastMode: false,
          });
          setSwitchState("error");
        }
      }
      throw error;
    }
  }

  function enqueueSelectionCommit(options = {}) {
    return enqueueSelectionSnapshot(
      snapshotSelection(),
      state.selectionRevision,
      options,
    );
  }

  function enqueueSelectionSnapshot(selection, revision, options = {}) {
    const committedSelection = Object.freeze({ ...selection });
    const committedOptions = Object.freeze({
      ...options,
      railBaseline: options.railBaseline
        ? Object.freeze({ ...options.railBaseline })
        : null,
    });
    let intent;
    try {
      intent = captureSelectionIntent();
    } catch (error) {
      return Promise.reject(error);
    }
    const task = state.commitQueue
      .catch(() => {})
      .then(() =>
        performSelectionCommit(
          committedSelection,
          revision,
          committedOptions,
          intent,
        )
      );
    state.commitQueue = task.catch(() => {});
    return task;
  }

  function cancelPendingKeyboardCommit({ restore = false } = {}) {
    const hadPendingCommit = state.commitTimer !== null;
    const baseline = state.pendingKeyboardBaseline;
    window.clearTimeout(state.commitTimer);
    state.commitTimer = null;
    state.pendingKeyboardBaseline = null;
    if (restore && baseline) applySelection(baseline);
    if (hadPendingCommit) state.selectionRevision += 1;
    return baseline;
  }

  function scheduleSelectionCommit(baseline) {
    if (!state.pendingKeyboardBaseline && baseline) {
      state.pendingKeyboardBaseline = Object.freeze({ ...baseline });
    }
    window.clearTimeout(state.commitTimer);
    state.commitTimer = window.setTimeout(() => {
      const railBaseline = state.pendingKeyboardBaseline;
      state.commitTimer = null;
      state.pendingKeyboardBaseline = null;
      void enqueueSelectionCommit({ railBaseline }).catch(() => {});
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
      element.textContent = state.defaultSelection ? "Default" : "Other";
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
      host.setAttribute("data-selector-model", recognized ? recognizedRow.name : state.defaultSelection ? "Default" : "Other");
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
      if (modelElement) modelElement.textContent = recognized ? recognizedRow.name : state.defaultSelection ? "Default" : "Other";
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

  function pointerSelection(host, clientX, clientY) {
    const stage = host.shadowRoot?.querySelector("#stage");
    if (!stage) return null;
    const rect = stage.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const x = clamp(clientX - rect.left, 0, rect.width);
    const y = clamp(clientY - rect.top, 0, rect.height);
    const scaledX = (x / rect.width) * STAGE_WIDTH;
    const scaledY = (y / rect.height) * STAGE_HEIGHT;
    const rowIndex = nearestRowFromY(scaledY);
    return {
      rowIndex,
      indexInRow: nearestIndexInRow(rowIndex, scaledX),
    };
  }

  function previewPointerSelection(
    host,
    clientX,
    clientY,
    startFastMode = state.fastMode,
  ) {
    const target = pointerSelection(host, clientX, clientY);
    if (!target) return false;
    if (
      state.currentRow === target.rowIndex &&
      state.currentIndex === target.indexInRow
    ) {
      return false;
    }

    state.currentRow = target.rowIndex;
    state.currentIndex = target.indexInRow;
    state.defaultSelection = false;
    const row = ROWS[target.rowIndex];
    state.recognizedRow = row;
    state.recognizedEffort = EFFORTS[row.dots[target.indexInRow] - 1];
    state.fastMode = pointerPreviewFastMode(startFastMode, row.supportsFast);
    state.lastSwitchError = null;
    updateSelectorUI(host);
    return true;
  }

  function handleSelectorKey(host, event) {
    const isArrow = event.key.startsWith("Arrow");
    const isSpace = event.key === " " || event.key === "Spacebar" || event.code === "Space";
    if (!isArrow && !isSpace) return false;

    event.preventDefault();
    event.stopImmediatePropagation();
    const keyStartSelection = snapshotSelection();

    if (isSpace) {
      if (
        !hasSelectorSelection() ||
        !ROWS[state.currentRow].supportsFast ||
        event.repeat
      ) {
        return true;
      }
      const pendingBaseline = cancelPendingKeyboardCommit();
      state.fastMode = !state.fastMode;
      markSelectionChanged(host);
      void enqueueSelectionCommit({
        railBaseline: pendingBaseline || keyStartSelection,
      }).catch(() => {});
      return true;
    }

    if (!hasSelectorSelection()) {
      state.currentRow = 0;
      state.currentIndex = 0;
      state.fastMode = false;
      markSelectionChanged(host);
      scheduleSelectionCommit(keyStartSelection);
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
      scheduleSelectionCommit(keyStartSelection);
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
    let activePointerID = null;
    let gestureStartSelection = null;
    let gestureRollbackSelection = null;
    let gestureSupersededKeyboardCommit = false;
    const clickMoveThreshold = 5;

    const resetPointerGesture = () => {
      stage?.classList.remove("dragging");
      pointerDownOnThumb = false;
      pointerMoved = false;
      activePointerID = null;
      gestureStartSelection = null;
      gestureRollbackSelection = null;
      gestureSupersededKeyboardCommit = false;
    };

    stage?.addEventListener("pointerdown", (event) => {
      if (!event.isPrimary || event.button !== 0 || activePointerID !== null) return;
      activePointerID = event.pointerId;
      pointerDownOnThumb = event.target === thumb && hasSelectorSelection();
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
      pointerMoved = false;
      gestureStartSelection = snapshotSelection();
      const pendingKeyboardBaseline = cancelPendingKeyboardCommit();
      gestureRollbackSelection = pendingKeyboardBaseline || gestureStartSelection;
      gestureSupersededKeyboardCommit = Boolean(pendingKeyboardBaseline);
      stage.setPointerCapture(event.pointerId);
      stage.classList.add("dragging");
      if (!pointerDownOnThumb) {
        previewPointerSelection(
          host,
          event.clientX,
          event.clientY,
          gestureStartSelection.fastMode,
        );
      }
    });

    stage?.addEventListener("pointermove", (event) => {
      if (
        event.pointerId !== activePointerID ||
        !stage.hasPointerCapture(event.pointerId)
      ) {
        return;
      }
      if (Math.hypot(event.clientX - pointerStartX, event.clientY - pointerStartY) > clickMoveThreshold) {
        pointerMoved = true;
      }
      if (!pointerDownOnThumb || pointerMoved) {
        previewPointerSelection(
          host,
          event.clientX,
          event.clientY,
          gestureStartSelection.fastMode,
        );
      }
    });

    stage?.addEventListener("pointerup", (event) => {
      if (event.pointerId !== activePointerID) return;
      let shouldCommit = true;
      const action = pointerReleaseAction(
        pointerDownOnThumb,
        pointerMoved,
        pointerStartX,
        pointerStartY,
        event.clientX,
        event.clientY,
        clickMoveThreshold,
      );
      if (action === "toggle-fast") {
        if (ROWS[state.currentRow]?.supportsFast) {
          state.fastMode = !state.fastMode;
          markSelectionChanged(host);
        } else {
          shouldCommit = false;
        }
      } else {
        previewPointerSelection(
          host,
          event.clientX,
          event.clientY,
          gestureStartSelection.fastMode,
        );
        if (selectionsEqual(gestureStartSelection, snapshotSelection())) {
          shouldCommit = shouldCommitUnchangedPointerSelection(
            gestureSupersededKeyboardCommit,
            Boolean(state.currentThreadID),
          );
        } else {
          state.selectionRevision += 1;
          state.railSelectionGeneration += 1;
        }
      }
      if (stage.hasPointerCapture(event.pointerId)) {
        stage.releasePointerCapture(event.pointerId);
      }
      window.clearTimeout(state.commitTimer);
      state.commitTimer = null;
      if (shouldCommit) {
        const selection = snapshotSelection();
        const revision = state.selectionRevision;
        void enqueueSelectionSnapshot(selection, revision, {
          railBaseline: gestureRollbackSelection,
        }).catch(() => {});
      }
      resetPointerGesture();
    });

    stage?.addEventListener("pointercancel", (event) => {
      if (event.pointerId !== activePointerID) return;
      if (gestureRollbackSelection) applySelection(gestureRollbackSelection);
      if (stage.hasPointerCapture(event.pointerId)) {
        stage.releasePointerCapture(event.pointerId);
      }
      resetPointerGesture();
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
    host.setAttribute("data-no-thread-switch-mode", "official-control-proxy");
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

  function markOfficialSelectionDirty() {
    state.officialInteractionEpoch += 1;
    state.officialSelectionDirty = true;
    state.confirmedSelection = null;
    state.confirmedThreadID = null;
    state.daybreakClassification = null;
    scheduleSync();
  }

  function eventTargetsOfficialPicker(event) {
    const path = typeof event.composedPath === "function"
      ? event.composedPath()
      : [];
    if (path.includes(state.popoverHost)) return false;
    if (
      path.some(
        (candidate) =>
          candidate instanceof Element &&
          (
            candidate.matches(TRIGGER_SELECTOR) ||
            candidate.matches(PRIMARY_SURFACE_SELECTOR) ||
            Boolean(candidate.closest(PRIMARY_SURFACE_SELECTOR))
          ),
      )
    ) {
      return true;
    }
    return event.type === "keydown" &&
      Boolean(findOpenTrigger()) &&
      (
        event.key?.startsWith("Arrow") ||
        event.key === "Enter" ||
        event.key === " " ||
        event.key === "Spacebar" ||
        event.code === "Space" ||
        event.key === "Escape"
      );
  }

  function eventTargetsOfficialSelectionControl(event) {
    const primarySurface = state.primarySurface;
    if (!primarySurface) return false;
    const ownedSurfaces = new Set([primarySurface]);
    const rows = officialAdvancedRows(primarySurface);
    for (const trigger of [
      rows?.modelTrigger,
      rows?.effortTrigger,
      rows?.speedTrigger,
    ]) {
      const controlledID = trigger?.getAttribute("aria-controls");
      const controlled = controlledID
        ? document.getElementById(controlledID)
        : null;
      if (
        controlled &&
        controlled.matches(PRIMARY_SURFACE_SELECTOR) &&
        isVisible(controlled)
      ) {
        ownedSurfaces.add(controlled);
      }
    }

    const keyActivatesLeaf = event.type !== "keydown" ||
      event.key === "Enter" ||
      event.key === " " ||
      event.key === "Spacebar" ||
      event.code === "Space";
    const path = typeof event.composedPath === "function"
      ? event.composedPath()
      : [];
    return path.some((candidate) => {
      if (!(candidate instanceof Element)) return false;
      const surface = candidate.closest(PRIMARY_SURFACE_SELECTOR);
      if (!surface || !ownedSurfaces.has(surface)) return false;
      if (candidate.matches("[data-model-picker-view-toggle]")) return false;
      if (
        candidate.matches(FAST_MODE_SELECTOR) ||
        candidate.matches(DAYBREAK_PROGRAM_CONTROL_SELECTOR) ||
        candidate.matches("[data-model-picker-power-slider]") ||
        candidate.matches(REASONING_SLIDER_SELECTOR)
      ) {
        return true;
      }
      return keyActivatesLeaf && candidate.matches(OFFICIAL_LEAF_ITEM_SELECTOR);
    });
  }

  function rememberTrustedOfficialSelectionAction(threadID) {
    window.clearTimeout(state.trustedSelectionActionTimer);
    state.trustedSelectionAction = {
      threadID,
      afterGeneration:
        state.latestThreadSettings.get(threadID)?.generation || 0,
      interactionEpoch: state.officialInteractionEpoch + 1,
    };
    state.trustedSelectionActionTimer = window.setTimeout(() => {
      state.trustedSelectionAction = null;
      state.trustedSelectionActionTimer = null;
    }, 1000);
  }

  function clearTrustedOfficialSelectionAction() {
    window.clearTimeout(state.trustedSelectionActionTimer);
    state.trustedSelectionActionTimer = null;
    state.trustedSelectionAction = null;
  }

  function handleOfficialInteraction(event) {
    const railHandlesKey = event.type === "keydown" &&
      state.popoverHost?.isConnected &&
      state.popoverHost.getAttribute("aria-hidden") !== "true" &&
      (
        event.key?.startsWith("Arrow") ||
        event.key === " " ||
        event.key === "Spacebar" ||
        event.code === "Space" ||
        event.key === "Escape"
    );
    if (railHandlesKey) return;
    if (!event.isTrusted || !eventTargetsOfficialPicker(event)) return;
    if (
      eventTargetsOfficialSelectionControl(event) &&
      state.currentThreadID &&
      (
        (event.type !== "pointerdown" && event.type !== "click") ||
        event.button === 0
      )
    ) {
      rememberTrustedOfficialSelectionAction(state.currentThreadID);
    }
    markOfficialSelectionDirty();
  }

  function handleOfficialMutations(records) {
    const selectionAttributes = new Set([
      "data-selected-reasoning-effort",
      "data-selected",
      "data-fast-mode-enabled",
      "aria-checked",
      "aria-busy",
      "aria-disabled",
    ]);
    const trigger = state.trigger;
    const primarySurface = state.primarySurface;
    const primaryStructureChanged = records.some((record) => {
      if (record.type !== "childList") return false;
      const target = record.target instanceof Element
        ? record.target
        : record.target?.parentElement;
      return Boolean(
        target &&
        primarySurface &&
        (target === primarySurface || primarySurface.contains(target)),
      );
    });
    const advancedRows = primarySurface
      ? officialAdvancedRows(primarySurface)
      : null;
    const ownedModelSubmenu = advancedRows?.modelTrigger
      ? findOfficialSubmenuSurface(
          advancedRows.modelTrigger,
          primarySurface,
          (surface) => officialLeafItemsInSurface(surface).length > 0,
        )
      : null;
    const daybreakRow = ALL_ROWS.find((row) => row.id === "daybreak-blue");
    const daybreakProgramChanged = records.some((record) => {
      const mutationTarget = record.target instanceof Element
        ? record.target
        : record.target?.parentElement;
      if (
        !mutationTarget ||
        !primarySurface ||
        (
          mutationTarget !== primarySurface &&
          !primarySurface.contains(mutationTarget)
        )
      ) {
        return false;
      }
      if (record.type === "attributes") {
        const target = record.target instanceof Element ? record.target : null;
        return Boolean(target?.matches(DAYBREAK_PROGRAM_CONTROL_SELECTOR));
      }
      if (record.type !== "childList") return false;
      return [...record.addedNodes, ...record.removedNodes].some((node) => {
        if (!(node instanceof Element)) return false;
        const candidates = [node, ...node.querySelectorAll("*")];
        return candidates.some((candidate) =>
          candidate.matches(DAYBREAK_PROGRAM_CONTROL_SELECTOR)
        );
      });
    });
    const daybreakModelStructureChanged = records.some((record) => {
      if (record.type !== "childList" || !daybreakRow) return false;
      const mutationTarget = record.target instanceof Element
        ? record.target
        : record.target?.parentElement;
      const inOwnedModelStructure = Boolean(
        mutationTarget &&
        (
          mutationTarget === ownedModelSubmenu ||
          ownedModelSubmenu?.contains(mutationTarget)
        )
      );
      if (!inOwnedModelStructure) return false;
      return [...record.addedNodes, ...record.removedNodes].some((node) => {
        if (!(node instanceof Element)) return false;
        const candidates = [node, ...node.querySelectorAll("*")];
        return candidates.some((candidate) =>
          officialElementMatchesModelLabels(
            candidate,
            daybreakRow.catalogDisplayNames,
          )
        );
      });
    });
    const daybreakStructureChanged =
      daybreakProgramChanged || daybreakModelStructureChanged;
    const selectionChanged = records.some((record) => {
      const target = record.target instanceof Element
        ? record.target
        : record.target?.parentElement;
      if (!target) return false;
      const inTrigger = Boolean(
        trigger && (target === trigger || trigger.contains(target)),
      );
      const inPrimary = Boolean(
        primarySurface &&
        (target === primarySurface || primarySurface.contains(target)),
      );
      const inOwnedModelSubmenu = Boolean(
        ownedModelSubmenu &&
        (target === ownedModelSubmenu || ownedModelSubmenu.contains(target)),
      );
      if (
        record.type === "attributes" &&
        target.matches(DAYBREAK_PROGRAM_CONTROL_SELECTOR)
      ) {
        return false;
      }
      if (
        record.type === "attributes" &&
        record.attributeName === "data-model-selected"
      ) {
        return inOwnedModelSubmenu || inPrimary;
      }
      if (record.type === "characterData" || record.type === "childList") {
        return inTrigger;
      }
      if (record.type !== "attributes" || (!inTrigger && !inPrimary)) {
        return false;
      }
      if (selectionAttributes.has(record.attributeName)) return true;
      if (record.attributeName !== "aria-label") return false;
      const viewToggle = target.closest("[data-model-picker-view-toggle]");
      return !viewToggle || !primarySurface?.contains(viewToggle);
    });
    if (selectionChanged || primaryStructureChanged) {
      state.officialSelectionMutationGeneration += 1;
    }
    // Opening a flyout for bounded classification changes its DOM structure.
    // Do not reinterpret that proxy-owned churn as a new external state change.
    if (shouldRecordDaybreakStructureChange(
      daybreakStructureChanged,
      state.officialProxyReadDepth,
    )) {
      state.officialStructureMutationGeneration += 1;
      if (daybreakProgramChanged) {
        state.officialDaybreakProgramMutationGeneration += 1;
      }
      if (!state.commitInFlight) {
        state.confirmedSelection = null;
        state.confirmedThreadID = null;
        state.daybreakClassification = null;
        state.officialSelectionDirty = true;
        setSwitchState(state.currentThreadID ? "loading" : "no-thread");
      }
    }
    const trustedSelection = state.trustedSelectionAction;
    if (
      selectionChanged &&
      trustedSelection?.threadID === state.currentThreadID &&
      trustedSelection.interactionEpoch === state.officialInteractionEpoch
    ) {
      const latest = state.latestThreadSettings.get(state.currentThreadID);
      if (!latest || latest.generation <= trustedSelection.afterGeneration) {
        state.latestThreadSettings.delete(state.currentThreadID);
      }
      clearTrustedOfficialSelectionAction();
    } else if (
      selectionChanged &&
      trustedSelection &&
      trustedSelection.interactionEpoch !== state.officialInteractionEpoch
    ) {
      clearTrustedOfficialSelectionAction();
    }
    const changed =
      !state.commitInFlight &&
      state.officialProxyReadDepth === 0 &&
      selectionChanged;
    if (changed) markOfficialSelectionDirty();
    else scheduleSync();
  }

  function syncNow() {
    if (state.disposed) return;
    state.scheduled = false;
    removePreviousVisual();

    const previousTrigger = state.trigger;
    const target = currentPrimaryTarget();
    state.trigger = target?.trigger ?? null;
    state.primarySurface = target?.surface ?? null;

    if (!target) {
      cancelPendingKeyboardCommit();
      state.currentThreadID = null;
      state.confirmedSelection = null;
      state.confirmedThreadID = null;
      state.daybreakClassification = null;
      removeDetachedPopover();
      return;
    }

    const triggerChanged = previousTrigger !== target.trigger;
    const previousComposerRoot =
      previousTrigger?.closest("[data-codex-composer-root]") || null;
    const nextComposerRoot =
      target.trigger.closest("[data-codex-composer-root]") || null;
    const resolvedThreadID = resolveCurrentThreadID(target.trigger);
    const threadIdentityChanged =
      (state.currentThreadID || null) !== (resolvedThreadID || null);
    const preserveConfirmedNoThreadSelection =
      shouldPreserveConfirmedNoThreadSelection(
        resolvedThreadID,
        state.currentThreadID,
        Boolean(previousComposerRoot) &&
          previousComposerRoot === nextComposerRoot,
        state.confirmedThreadID,
        Boolean(state.confirmedSelection),
        state.officialSelectionDirty,
        state.commitInFlight,
      );
    if (triggerChanged || threadIdentityChanged) {
      cancelPendingKeyboardCommit();
      if (!preserveConfirmedNoThreadSelection) {
        state.confirmedSelection = null;
        state.confirmedThreadID = null;
      }
      if (
        threadIdentityChanged ||
        previousComposerRoot !== nextComposerRoot
      ) {
        state.daybreakClassification = null;
      }
    }
    const shouldInitialize = state.officialProxyReadDepth === 0 &&
      (
        triggerChanged ||
        threadIdentityChanged ||
        state.observedSurface !== target.surface ||
        (state.officialSelectionDirty && !state.commitInFlight)
      );
    if (shouldInitialize) {
      resetPlacementSession();
      initializeSelectorFromTrigger(target.trigger);
      if (!state.commitInFlight) state.officialSelectionDirty = false;
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
    if (state.disposed || state.scheduled) return;
    state.scheduled = true;
    requestAnimationFrame(syncNow);
  }

  function handleWindowResize() {
    cancelPlacementReturn();
    state.latchedPlacement = null;
    scheduleSync();
  }

  state.observer = new MutationObserver(handleOfficialMutations);
  state.observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: [
      "aria-expanded",
      "aria-controls",
      "data-state",
      "hidden",
      "data-selected-reasoning-effort",
      "data-selected",
      "data-model-selected",
      "data-fast-mode-enabled",
      "aria-checked",
      "aria-busy",
      "aria-disabled",
      "aria-label",
      "data-above-composer-conversation-id",
    ],
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
    const railBaseline = snapshotSelection();
    const accepted = applySelection({ modelName, effort, fastMode }, { render: false });
    if (!accepted) return Promise.reject(new Error("Unsupported Copicker selection."));
    state.selectionRevision += 1;
    state.railSelectionGeneration += 1;
    if (state.popoverHost) updateSelectorUI(state.popoverHost);
    cancelPendingKeyboardCommit();
    return enqueueSelectionCommit({ railBaseline });
  };
  state.commitCurrentSelection = (options = {}) => enqueueSelectionCommit({
    railBaseline: snapshotSelection(),
    ...options,
  });
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
    cancelPendingKeyboardCommit({ restore: true });
    state.dismissedForCurrentOpen = true;
    removeDetachedPopover();
  };
  state.handleWindowBlur = () => state.dismissForCurrentOpen();
  state.handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") state.dismissForCurrentOpen();
  };
  state.handleKeyDown = (event) => {
    if (state.modelListKeyboardDispatch && !event.isTrusted) return;
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
    cancelPendingKeyboardCommit();
    cancelPlacementReturn();
    clearTrustedOfficialSelectionAction();
    window.removeEventListener("message", state.handleBridgeMessage, true);
    window.removeEventListener("resize", handleWindowResize);
    window.removeEventListener("scroll", scheduleSync, true);
    window.removeEventListener("blur", state.handleWindowBlur);
    document.removeEventListener("visibilitychange", state.handleVisibilityChange);
    document.removeEventListener("keydown", state.handleKeyDown, true);
    document.removeEventListener("pointerdown", state.handleOfficialInteraction, true);
    document.removeEventListener("wheel", state.handleOfficialInteraction, true);
    document.removeEventListener("keydown", state.handleOfficialInteraction, true);
    document.removeEventListener("click", state.handleOfficialInteraction, true);
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
  state.handleOfficialInteraction = handleOfficialInteraction;
  document.addEventListener("pointerdown", state.handleOfficialInteraction, true);
  document.addEventListener("wheel", state.handleOfficialInteraction, true);
  document.addEventListener("keydown", state.handleOfficialInteraction, true);
  document.addEventListener("click", state.handleOfficialInteraction, true);
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
    noThreadSwitchMode: "official-control-proxy",
    design: "preview-2d",
    version: VERSION,
  };
})();
