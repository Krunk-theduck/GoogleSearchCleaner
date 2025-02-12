const DEFAULT_CONFIG = {
  extensionEnabled: true,
  unwantedParams: [
    'sourceid', 'rlz', 'ie', 'ved', 'sa', 'usg', 'bih', 'biw', 'oq', 'gs_l',
    'client', 'channel', 'cs', 'ei', 'sclient', 'start', 'tbs', 'tbm', 'stick', 'gs_lcrp'
  ],
  cookieManagement: {
    enabled: true,
    clearOnSearch: true,
    blockedCookies: ['NID', 'CONSENT', '1P_JAR', 'AEC', 'SOCS']
  },
  headers: {
    remove: ['X-Client-Data', 'Cookie', 'Referer'],
    add: {
      'DNT': '1',
      'Sec-GPC': '1'
    }
  },
  privacyFeatures: {
    disablePersonalization: true,
    blockTracking: true,
    useDNT: true,
    useSecGPC: true,
    forceHttps: true,
  },
  userAgentSpoofing: {
    enabled: false,
    value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" // A common Chrome User-Agent - UPDATE to latest Chrome version if needed
  },
};

// Load configuration
async function loadConfig() {
  try {
    const result = await chrome.storage.sync.get({ config: DEFAULT_CONFIG });
    //ExtensionDebugger.log('Configuration loaded:', result.config);
    return result.config;
  } catch (error) {
    //ExtensionDebugger.error('Failed to load configuration:', error);
    return DEFAULT_CONFIG;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const debugLog = document.getElementById('debugLog');
  const debugSection = document.getElementById('debugSection');
  let config = await loadConfig();

  function logDebug(message, isError = false) {
    const entry = document.createElement('div');
    entry.className = `debug-entry${isError ? ' debug-error' : ''}`;
    entry.textContent = `[${new Date().toISOString()}] ${message}`;
    debugLog.appendChild(entry);
    debugLog.scrollTop = debugLog.scrollHeight;
  }

  function createToggleSwitch(id, checked, onChange) {
    const label = document.createElement('label');
    label.className = 'toggle-switch';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checked;
    input.addEventListener('change', onChange);

    const slider = document.createElement('span');
    slider.className = 'slider';

    label.appendChild(input);
    label.appendChild(slider);
    return label;
  }

  function createTooltip(text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.innerHTML = `
      <i class="fas fa-info-circle"></i>
      <span class="tooltip-text">${text}</span>
    `;
    return tooltip;
  }

  // Privacy Features Section
  function renderExtensionToggle() {
    const container = document.getElementById('extensionStatusToggle');
    container.innerHTML = ''; // Clear container

    const enabledToggle = createToggleSwitch(
      'extensionEnabledToggle',
      config.extensionEnabled,
      (e) => {
        config.extensionEnabled = e.target.checked; // Update config on toggle
        updateExtensionStatusIndicator(config.extensionEnabled); // Update status indicator
        logDebug(`Extension Enabled toggled ${config.extensionEnabled ? 'ON' : 'OFF'}`);
      }
    );

    const label = document.createElement('div');
    label.className = 'param-label';
    label.textContent = 'Extension Enabled';

    container.appendChild(enabledToggle);
    container.appendChild(label);
    container.appendChild(createTooltip('Master toggle to enable or disable the entire Google Search Cleaner extension.')); // Add tooltip

    updateExtensionStatusIndicator(config.extensionEnabled); // Initial status indicator update
  }

  function updateExtensionStatusIndicator(isEnabled) {
    const statusIndicator = document.getElementById('extensionStatus');
    if (isEnabled) {
      statusIndicator.className = 'status-indicator status-active';
      statusIndicator.title = 'Extension is ACTIVE';
    } else {
      statusIndicator.className = 'status-indicator status-inactive';
      statusIndicator.title = 'Extension is INACTIVE';
    }
  }

  function renderPrivacyFeatures() {
    const container = document.getElementById('privacyFeatures');
    container.innerHTML = '';

    const features = [
      {
        id: 'disablePersonalization',
        label: 'Disable Search Personalization',
        tooltip: 'Prevents Google from customizing search results based on your history'
      },
      {
        id: 'blockTracking',
        label: 'Block Tracking',
        tooltip: 'Blocks various Google tracking mechanisms'
      },
      {
        id: 'useDNT',
        label: 'Send Do Not Track',
        tooltip: 'Sends DNT header with requests'
      },
      {
        id: 'useSecGPC',
        label: 'Enable Global Privacy Control',
        tooltip: 'Sends Sec-GPC header with requests'
      },
      {
        id: 'forceHttps',
        label: 'Force HTTPS',
        tooltip: 'Always use secure connections'
      }
    ];

    features.forEach(feature => {
      const div = document.createElement('div');
      div.className = 'param-item';

      const toggle = createToggleSwitch(
        feature.id,
        config.privacyFeatures[feature.id],
        (e) => config.privacyFeatures[feature.id] = e.target.checked
      );

      const label = document.createElement('div');
      label.className = 'param-label';
      label.textContent = feature.label;

      div.appendChild(toggle);
      div.appendChild(label);
      div.appendChild(createTooltip(feature.tooltip));

      container.appendChild(div);
    });
  }

  function renderUserAgentSpoofing() {
    const container = document.getElementById('headerManagement');
    container.innerHTML += '';

    const uaDiv = document.createElement('div');
    uaDiv.className = 'param-item';

    const enabledToggle = createToggleSwitch(
      'uaEnabled',
      config.userAgentSpoofing.enabled,
      (e) => { // **Explicit function block for clarity**
        config.userAgentSpoofing.enabled = e.target.checked;
        console.log("User-Agent Spoofing Enabled Toggled:", config.userAgentSpoofing.enabled);
      }
    );

    const label = document.createElement('div');
    label.className = 'param-label';
    label.textContent = 'Enable User-Agent Spoofing';

    uaDiv.appendChild(enabledToggle);
    uaDiv.appendChild(label);
    uaDiv.appendChild(createTooltip('Spoofs the User-Agent header to a generic value to reduce browser fingerprinting.'));

    container.appendChild(uaDiv);

    // User-Agent Value Textarea
    const uaValueDiv = document.createElement('div');
    uaValueDiv.className = 'param-item';
    uaValueDiv.innerHTML = `
      <div class="param-label">
        Generic User-Agent String
        <div class="param-description">
          <textarea rows="2" style="width: 100%; margin-top: 0.5rem;">${config.userAgentSpoofing.value}</textarea>
        </div>
      </div>
    `;

    const uaTextarea = uaValueDiv.querySelector('textarea');
    uaTextarea.addEventListener('change', (e) => {
      config.userAgentSpoofing.value = e.target.value;
    });

    container.appendChild(uaValueDiv);
  }

  // Cookie Management Section
  function renderCookieManagement() {
    const container = document.getElementById('cookieManagement');
    container.innerHTML = '';

    const cookieDiv = document.createElement('div');
    cookieDiv.className = 'param-item';

    const enabledToggle = createToggleSwitch(
      'cookieEnabled',
      config.cookieManagement.enabled,
      (e) => config.cookieManagement.enabled = e.target.checked
    );

    const label = document.createElement('div');
    label.className = 'param-label';
    label.textContent = 'Enable Cookie Management';

    cookieDiv.appendChild(enabledToggle);
    cookieDiv.appendChild(label);
    cookieDiv.appendChild(createTooltip('Manage Google cookies automatically'));

    container.appendChild(cookieDiv);

    // Cookie clear on search option
    const clearDiv = document.createElement('div');
    clearDiv.className = 'param-item';

    const clearToggle = createToggleSwitch(
      'clearOnSearch',
      config.cookieManagement.clearOnSearch,
      (e) => config.cookieManagement.clearOnSearch = e.target.checked
    );

    const clearLabel = document.createElement('div');
    clearLabel.className = 'param-label';
    clearLabel.textContent = 'Clear Cookies on Search';

    clearDiv.appendChild(clearToggle);
    clearDiv.appendChild(clearLabel);
    clearDiv.appendChild(createTooltip('Clear cookies before each search'));

    container.appendChild(clearDiv);

    // Blocked cookies list
    const blockedCookies = document.createElement('div');
    blockedCookies.className = 'param-item';
    blockedCookies.innerHTML = `
      <div class="param-label">
        Blocked Cookies
        <div class="param-description">
          <textarea rows="4" style="width: 100%; margin-top: 0.5rem;">${config.cookieManagement.blockedCookies.join(', ')}</textarea>
        </div>
      </div>
    `;

    const textarea = blockedCookies.querySelector('textarea');
    textarea.addEventListener('change', (e) => {
      config.cookieManagement.blockedCookies = e.target.value
        .split(',')
        .map(cookie => cookie.trim())
        .filter(cookie => cookie);
    });

    container.appendChild(blockedCookies);
  }

  // URL Parameters Section
  function renderURLParameters() {
    const container = document.getElementById('paramsList');
    container.innerHTML = '';

    const parameters = [
      { id: 'sourceid', description: 'Tracks the source of the search request' },
      { id: 'rlz', description: 'Tracks the browser and device used' },
      { id: 'ie', description: 'Specifies character encoding' },
      { id: 'ved', description: 'Tracks user interactions' },
      { id: 'sa', description: 'Tracks internal actions' },
      { id: 'usg', description: 'Tracks user-specific data' },
      { id: 'bih', description: 'Browser viewport height' },
      { id: 'biw', description: 'Browser viewport width' },
      { id: 'oq', description: 'Original query text' },
      { id: 'gs_l', description: 'Search suggestions data' },
      { id: 'client', description: 'Client application identifier' },
      { id: 'channel', description: 'Distribution channel' },
      { id: 'cs', description: 'Character set' },
      { id: 'ei', description: 'Event identifier' },
      { id: 'sclient', description: 'Search client type' },
      { id: 'gs_lcrp', description: 'Chrome Reporting for Google analytics and debugging.' }
    ];

    parameters.forEach(param => {
      const div = document.createElement('div');
      div.className = 'param-item';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'param-checkbox';
      checkbox.checked = config.unwantedParams.includes(param.id);
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          config.unwantedParams.push(param.id);
        } else {
          config.unwantedParams = config.unwantedParams.filter(p => p !== param.id);
        }
      });

      const label = document.createElement('div');
      label.className = 'param-label';
      label.innerHTML = `
        ${param.id}
        <div class="param-description">${param.description}</div>
      `;

      div.appendChild(checkbox);
      div.appendChild(label);
      container.appendChild(div);
    });
  }

  // Header Management Section
  function renderHeaderManagement() {
    const container = document.getElementById('headerManagement');
    container.innerHTML = '';

    const removeHeaders = document.createElement('div');
    removeHeaders.className = 'param-item';
    removeHeaders.innerHTML = `
      <div class="param-label">
        Headers to Remove
        <div class="param-description">
          <textarea rows="4" style="width: 100%; margin-top: 0.5rem;">${config.headers.remove.join(', ')}</textarea>
        </div>
      </div>
    `;

    const removeTextarea = removeHeaders.querySelector('textarea');
    removeTextarea.addEventListener('change', (e) => {
      config.headers.remove = e.target.value
        .split(',')
        .map(header => header.trim())
        .filter(header => header);
    });

    container.appendChild(removeHeaders);

    const addHeaders = document.createElement('div');
    addHeaders.className = 'param-item';
    addHeaders.innerHTML = `
      <div class="param-label">
        Headers to Add
        <div class="param-description">
          <textarea rows="4" style="width: 100%; margin-top: 0.5rem;">${Object.entries(config.headers.add)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')
      }</textarea>
        </div>
      </div>
    `;

    const addTextarea = addHeaders.querySelector('textarea');
    addTextarea.addEventListener('change', (e) => {
      config.headers.add = Object.fromEntries(
        e.target.value
          .split('\n')
          .map(line => line.split(':').map(part => part.trim()))
          .filter(parts => parts.length === 2)
      );
    });

    container.appendChild(addHeaders);
  }

  function initializeUI() {
    renderExtensionToggle();
    renderPrivacyFeatures();
    renderCookieManagement();
    renderURLParameters();
    renderHeaderManagement();
    renderUserAgentSpoofing();
  }

  initializeUI();

  document.getElementById('save').addEventListener('click', async () => {
    const saveButton = document.getElementById('save');

    try {
      await chrome.storage.sync.set({ config });
      logDebug('Settings saved successfully');

      saveButton.classList.add('save-feedback');
      setTimeout(() => {
        saveButton.classList.remove('save-feedback');
      }, 500);

    } catch (error) {
      logDebug(`Error saving settings: ${error.message}`, true);
    }
  });

  document.getElementById('reset').addEventListener('click', async () => {
    try {
      config = DEFAULT_CONFIG;
      await chrome.storage.sync.set({ config });
      initializeUI();
      logDebug('Settings reset to defaults');
    } catch (error) {
      logDebug(`Error resetting settings: ${error.message}`, true);
    }
  });

  document.getElementById('toggleDebug').addEventListener('click', () => {
    const debugSection = document.getElementById('debugSection');
    const debugButton = document.getElementById('toggleDebug');
    const debugTitle = document.querySelector('#debugSection .section-title');

    debugSection.style.display = debugSection.style.display === 'none' ? 'block' : 'none';
    const isDebugModeOn = debugSection.style.display === 'block';

    debugButton.innerHTML = isDebugModeOn ? '<i class="fas fa-bug"></i> Hide Debug' : '<i class="fas fa-bug"></i> Show Debug';

    if (isDebugModeOn) {
      debugTitle.classList.add('debug-mode-active');
    } else {
      debugTitle.classList.remove('debug-mode-active');
    }

    const messageText = isDebugModeOn ? 'Debug Mode ON' : 'Debug Mode OFF';

    logDebug(`Debug mode toggled ${isDebugModeOn ? 'ON' : 'OFF'}`);
  });

  // Extension Status Indicator
  const updateStatus = async () => {
    const status = document.getElementById('extensionStatus');
    try {
      await chrome.runtime.sendMessage({ type: 'ping' });
      status.className = 'status-indicator status-active';
      logDebug('Extension is active');
    } catch (error) {
      status.className = 'status-indicator status-inactive';
    }
  };

  updateStatus();
  setInterval(updateStatus, 5000);

  logDebug('Options page initialized');
});