const DEBUG = true;

class ExtensionDebugger {
  static log(message, data = null) {
    if (DEBUG) {
      console.log(`[GSC Debug] ${message}`, data || '');
    }
  }

  static error(message, error) {
    if (DEBUG) {
      console.error(`[GSC Error] ${message}`, error);
    }
  }
}

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
    ExtensionDebugger.log('Configuration loaded:', result.config);
    return result.config;
  } catch (error) {
    ExtensionDebugger.error('Failed to load configuration:', error);
    return DEFAULT_CONFIG;
  }
}

// Header Management
async function updateHeaderRules() {
  try {
    const config = await loadConfig();
    if (!config.extensionEnabled) {
      ExtensionDebugger.log('Extension disabled, skipping header rule updates.');
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [...Array(3001).keys()].slice(1000),
        addRules: []
      });
      return;
    }
    const rules = [];

    // Remove headers
    config.headers.remove.forEach((header, index) => {
      rules.push({
        id: 1000 + index,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          requestHeaders: [{
            header: header,
            operation: 'remove'
          }]
        },
        condition: {
          urlFilter: '*://www.google.com/*',
          resourceTypes: ['main_frame', 'xmlhttprequest']
        }
      });
    });

    // Add headers
    Object.entries(config.headers.add).forEach(([header, value], index) => {
      rules.push({
        id: 2000 + index,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          requestHeaders: [{
            header: header,
            operation: 'set',
            value: value
          }]
        },
        condition: {
          urlFilter: '*://www.google.com/*',
          resourceTypes: ['main_frame', 'xmlhttprequest']
        }
      });
    });

    if (config.userAgentSpoofing.enabled && config.userAgentSpoofing.value) {
      rules.push({
        id: 3000,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          requestHeaders: [{
            header: 'User-Agent',
            operation: 'set',
            value: config.userAgentSpoofing.value
          }]
        },
        condition: {
          urlFilter: '*://www.google.com/*',
          resourceTypes: ['main_frame', 'xmlhttprequest'] // Apply to main frames and xhr requests (adjust resourceTypes if needed)
        }
      });
    }

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rules.map(rule => rule.id),
      addRules: rules
    });

    ExtensionDebugger.log('Header rules updated:', rules);
  } catch (error) {
    ExtensionDebugger.error('Failed to update header rules:', error);
  }
}

// URL Parameter Management
async function updateParameterRules() {
  try {
    const config = await loadConfig();
    if (!config.extensionEnabled) {
      ExtensionDebugger.log('Extension disabled, skipping parameter rule updates.');
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [1],
        addRules: []
      });
      return;
    }
    const rule = {
      id: 1,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          transform: {
            queryTransform: {
              removeParams: config.unwantedParams,
              addOrReplaceParams: [
                { key: 'peek_pws', value: '0' },
                { key: 'pws', value: '0' },
                { key: 'safe', value: config.privacyFeatures.safeSearch ? 'active' : 'off' },
                { key: 'sei', value: '' },
                { key: 'sg_ss', value: '' }
              ]
            }
          }
        }
      },
      condition: {
        urlFilter: '*://www.google.com/search*',
        resourceTypes: ['main_frame', 'xmlhttprequest']
      }
    };

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1],
      addRules: [rule]
    });

    ExtensionDebugger.log('Parameter rules updated:', rule);
  } catch (error) {
    ExtensionDebugger.error('Failed to update parameter rules:', error);
  }
}

async function updateCookieRules() {
  try {
    const config = await loadConfig();
    if (!config.extensionEnabled) {
      ExtensionDebugger.log('Extension disabled, skipping cookie rule updates.');
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [...Array(3000 + config.cookieManagement.blockedCookies.length).keys()].slice(3000),
        addRules: []
      });
      return;
    }

    if (!config.cookieManagement.enabled) {
      return;
    }

    const cookieRules = config.cookieManagement.blockedCookies.map((cookie, index) => ({
      id: 3000 + index,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        responseHeaders: [
          {
            header: 'Set-Cookie',
            operation: 'remove'
          }
        ]
      },
      condition: {
        urlFilter: '*://*.google.com/*',
        resourceTypes: ['main_frame', 'xmlhttprequest']
      }
    }));

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: cookieRules.map(rule => rule.id),
      addRules: cookieRules
    });

    ExtensionDebugger.log('Cookie rules updated:', cookieRules);
  } catch (error) {
    ExtensionDebugger.error('Failed to update cookie rules:', error);
  }
}

async function clearGoogleCookies() {
  try {
    const config = await loadConfig();
    if (!config.cookieManagement.enabled) return;

    const cookies = await chrome.cookies.getAll({ domain: '.google.com' });
    for (const cookie of cookies) {
      if (config.cookieManagement.blockedCookies.includes(cookie.name)) {
        await chrome.cookies.remove({
          url: `https://www.google.com${cookie.path}`,
          name: cookie.name
        });
        ExtensionDebugger.log(`Removed cookie: ${cookie.name}`);
      }
    }
  } catch (error) {
    ExtensionDebugger.error('Failed to clear cookies:', error);
  }
}

// Event Listeners
chrome.runtime.onInstalled.addListener(async () => {
  try {
    await updateHeaderRules();
    await updateParameterRules();
    await updateCookieRules();

    chrome.contextMenus.create({
      id: 'searchWithGoogle',
      title: 'Search with Clean Google',
      contexts: ['selection']
    });

    ExtensionDebugger.log('Extension installed and initialized');
  } catch (error) {
    ExtensionDebugger.error('Failed to initialize extension:', error);
  }
});

// Update the storage change listener to include cookie rules
chrome.storage.onChanged.addListener(async (changes) => {
  if (changes.config) {
    try {
      await updateHeaderRules();
      await updateParameterRules();
      await updateCookieRules();
      ExtensionDebugger.log('Rules updated due to config change');
    } catch (error) {
      ExtensionDebugger.error('Failed to update rules after config change:', error);
    }
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && tab.url?.includes('google.com/search')) {
    try {
      const config = await loadConfig();
      if (config.cookieManagement.clearOnSearch) {
        await clearGoogleCookies();
        ExtensionDebugger.log('Cookies cleared on search');
      }
    } catch (error) {
      ExtensionDebugger.error('Failed to clear cookies on navigation:', error);
    }
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'searchWithGoogle' && info.selectionText) {
    try {
      const query = encodeURIComponent(info.selectionText);
      const url = `https://www.google.com/search?q=${query}&peek_pws=0&pws=0`;
      chrome.tabs.create({ url });
      ExtensionDebugger.log('Context menu search executed:', url);
    } catch (error) {
      ExtensionDebugger.error('Failed to execute context menu search:', error);
    }
  }
});