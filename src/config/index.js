const {
  ipcRenderer,
} = require('electron');

(() => {
  'use strict';

  window.addEventListener('beforeunload', (_e) => {
    const channels =
      document.getElementById('js-channels').value
        .split(/\r?\n/)
        .map(s => s.trim().replace('#', ''))
        .filter(s => s.length > 0);
    ipcRenderer.send('save-setting', {
      token: document.getElementById('js-token').value.trim(),
      channels,
    });
  });

  ipcRenderer.on('store', (_e, params) => {
    document.getElementById('js-token').value = params.token;
    document.getElementById('js-channels').value = params.channels.join('\n');
  });

  ipcRenderer.send('load-setting');
})();
