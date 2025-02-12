document.addEventListener('DOMContentLoaded', () => {
    const paramsList = document.getElementById('paramsList');
    const saveBtn = document.getElementById('save');
    const ALL_PARAMS = [
      { id: 'sourceid', description: 'Tracks the source of the search request.' },
      { id: 'rlz', description: 'Tracks the browser and device used for the search.' },
      { id: 'ie', description: 'Specifies the character encoding (usually unnecessary).' },
      { id: 'ved', description: 'Tracks user interactions with search results.' },
      { id: 'sa', description: 'Tracks internal actions on search results.' },
      { id: 'usg', description: 'Tracks user-specific data for personalized results.' },
      { id: 'bih', description: 'Tracks the browser viewport height.' },
      { id: 'biw', description: 'Tracks the browser viewport width.' },
      { id: 'oq', description: 'Tracks the original query for autocorrected searches.' },
      { id: 'gs_l', description: 'Tracks search suggestions and history.' },
      { id: 'client', description: 'Tracks the client application (e.g., browser).' }
    ];
  
    // Load saved settings
    chrome.storage.sync.get({ unwantedParams: ALL_PARAMS.map(param => param.id) }, (data) => {
      ALL_PARAMS.forEach(param => {
        const div = document.createElement('div');
        div.className = 'param-item';
  
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = param.id;
        checkbox.checked = data.unwantedParams.includes(param.id);
        div.appendChild(checkbox);
  
        const label = document.createElement('label');
        label.htmlFor = param.id;
        label.textContent = param.id;
        div.appendChild(label);
  
        const desc = document.createElement('div');
        desc.className = 'param-description';
        desc.textContent = param.description;
        div.appendChild(desc);
  
        paramsList.appendChild(div);
      });
    });
  
    // Save settings
    saveBtn.addEventListener('click', () => {
      const selected = Array.from(document.querySelectorAll('input[type="checkbox"]'))
        .filter(cb => cb.checked)
        .map(cb => cb.id);
  
      // Update storage
      chrome.storage.sync.set({ unwantedParams: selected }, () => {
        alert('Settings saved.');
      });
    });
  });