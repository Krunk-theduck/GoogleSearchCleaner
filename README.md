# 🌐 Google Search Cleaner  
*A browser extension to reduce personalization and tracking on Google Search for more consistent, unbiased results.*  

⚠ **Note:** This extension is **not** a full privacy solution. It limits certain tracking elements and reduces personalization but does **not** block all forms of tracking.

---

## 🚀 **Features**  
| 🌟 Feature                           | 🛡️ Description                                                                                                          |
|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| 🔗 **URL Parameter Cleaning**         | Removes tracking parameters from search URLs (e.g., `sourceid`, `rlz`, `ved`).                                          |
| 🛑 **Cookie Management**              | Blocks specific tracking cookies (`NID`, `CONSENT`, `1P_JAR`, etc.). Optional auto-clear on every new search.           |
| 🔒 **Privacy Headers**                | Adds `DNT: 1` (Do Not Track) and `Sec-GPC: 1` (Global Privacy Control) headers.                                        |
| 📋 **Header Modification**            | Removes headers like `X-Client-Data`, `Cookie`, and `Referer` to reduce shared info.                                   |
| 👥 **User-Agent Spoofing (Optional)** | Spoofs the User-Agent string to a generic Chrome version to minimize fingerprinting.                                    |
| 🔄 **Global Enable/Disable Toggle**   | Easily enable or disable the extension via a toggle in the options menu.                                               |
| 🔍 **Context Menu Search**            | Right-click text and select "Search with Clean Google" for an automatic cleaned search.                                 |
| 🛠️ **Debug Mode**                     | Logs extension activity for troubleshooting.                                                                           |

---

## 🛠 **Installation Guide**  

Follow these steps to install the extension:  

| Step | Action                                                                                                   |
|------|----------------------------------------------------------------------------------------------------------|
| 1️⃣   | **Download the Extension**: Download the `.zip` file or clone the source code.                           |
| 2️⃣   | **Open Your Browser**: Go to `chrome://extensions/` (or `edge://extensions/`, `brave://extensions/`).    |
| 3️⃣   | **Enable Developer Mode**: Switch on "Developer mode" at the top right.                                  |
| 4️⃣   | **Load Extension**: Click "Load unpacked" and select the extension folder or `.zip` file.                |
| 5️⃣   | **Done!** You should now see the extension icon in your toolbar.                                         |

---

## 🔧 **How to Use**  

### 🌍 **Normal Google Search**  
Use Google as you normally would! The extension cleans URLs in the background based on your preferences.  

### 🖱 **Context Menu Search**  
- Highlight any text on a webpage.  
- Right-click and choose **"Search with Clean Google"** to search with all tracking parameters removed.  

### ⚙️ **Options Menu Overview**  
Use the options page to customize how the extension behaves.  

| Option                           | Description                                                                                          |
|----------------------------------|------------------------------------------------------------------------------------------------------|
| 🔘 **Global Toggle**              | Master switch to enable or disable the extension.                                                    |
| 🧹 **URL Parameter Removal**      | Removes tracking parameters (`sourceid`, `rlz`, `ved`, etc.).                                        |
| 🍪 **Cookie Management**          | Blocks and optionally clears tracking cookies on each search.                                        |
| 📋 **Header Modification**        | Removes `X-Client-Data`, `Referer`, and `Cookie` headers.                                           |
| 🕵️ **User-Agent Spoofing**        | Optionally replace your User-Agent with a generic Chrome string.                                     |
| 🔍 **Safe Search Toggle**         | Enable or disable Google Safe Search.                                                                |
| 🛡️ **Privacy Headers**            | Always on: `DNT: 1` (Do Not Track) and `Sec-GPC: 1` (Global Privacy Control).                       |
| 🛠 **Debug Mode**                 | View logs for troubleshooting or monitoring extension activity.                                      |

---

## 📊 **Visual Breakdown**  

### URL Cleaning Example  
Before:  
`https://www.google.com/search?q=example&sourceid=chrome&rlz=1C1GCEU_enUS&ved=0ahUKEw`  

After Cleaning:  
`https://www.google.com/search?q=example&peek_pws=0`  

---

## 📝 **Disclaimer**  
Google Search Cleaner focuses on minimizing personalization and tracking in Google Search. It is **not** a comprehensive privacy solution and does not block all forms of Google tracking.  
