const DEFAULT_UNWANTED = [
  'sourceid', 'rlz', 'ie', 'ved', 'sa',
  'usg', 'bih', 'biw', 'oq', 'gs_l', 'client'
];

// Load stored settings
chrome.storage.sync.get({ unwantedParams: DEFAULT_UNWANTED }, (data) => {
  console.log("Loaded settings:", data.unwantedParams);
});

// Context menu support
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "searchWithGoogle",
    title: "Search with Clean Google",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "searchWithGoogle" && info.selectionText) {
    const query = encodeURIComponent(info.selectionText);
    const url = `https://www.google.com/search?q=${query}&peek_pws=0&pws=0`;
    chrome.tabs.create({ url });
  }
});