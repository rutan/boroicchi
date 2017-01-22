const {
  app,
  BrowserWindow,
  Menu,
  Tray,
  ipcMain,
} = require('electron');
const path = require('path');
const url = require('url');

const initMenu = require('./lib/init-menu.js');
const createWatcher = require('./lib/create-watcher.js');
const changeWallpaper = require('./lib/change-wallpaper.js');
const getPath = require('./lib/get-path.js');
const SimpleStore = require('./lib/simple-store.js');

let configWindow;
let workerWindow;
let tray;
let watcher;
let store;

function createWorker() {
  if (workerWindow) return;

  workerWindow = new BrowserWindow({
    width: 100,
    height: 100,
    skipTaskbar: true,
    show: false,
  });
  workerWindow.on('closed', () => {
    // nothing to do
  });
  workerWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'worker', 'index.html'),
    protocol: 'file:',
    slashes: true,
  }));

  if (process.env.NODE_ENV === 'development') workerWindow.webContents.openDevTools();
}

function createConfigWindow() {
  if (configWindow) {
    configWindow.showInactive();
    return;
  }

  configWindow = new BrowserWindow({
    width: 500,
    height: 185,
    resizable: false,
    fullscreenable: false,
    titleBarStyle: 'hidden',
  });
  configWindow.on('closed', () => {
    configWindow = null;
    app.dock.hide();
  });
  configWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'config', 'index.html'),
    protocol: 'file:',
    slashes: true,
  }));
  app.dock.show();

  if (process.env.NODE_ENV === 'development') configWindow.webContents.openDevTools();
}

function createTray() {
  tray = new Tray(path.join(__dirname, '..', 'icons', 'tray.png'));
  tray.setPressedImage(path.join(__dirname, '..', 'icons', 'tray-highlight.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Configure',
      click() {
        createConfigWindow();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click() {
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
}

function startWatchingSlack() {
  if (watcher) watcher.disconnect();
  if (!store.value.token || store.value.token.length === 0) return;
  if (!store.value.channels || store.value.channels.length === 0) return;

  watcher = createWatcher({
    token: store.value.token,
    channelNames: store.value.channels,
    onReceiveURL(receivedUrl) {
      console.log('receivedUrl:', receivedUrl);
      workerWindow.webContents.send('draw', receivedUrl);
    },
    onClose() {
      watcher = null;
      setTimeout(() => {
        startWatchingSlack();
      }, 1000 * 10);
    },
  }).catch((e) => {
    console.error(e);
    watcher = null;
  });
}

app.on('ready', () => {
  app.dock.hide();
  initMenu();
  store = new SimpleStore('store');
  store.load()
    .then(() => {
      createWorker();
      startWatchingSlack();
      createTray();
    })
    .catch(e => console.error(e));
});

app.on('window-all-closed', () => {
  // nothing to do
});

ipcMain.on('worker-inited', (e) => {
  e.sender.send('load', getPath('wallpaper'));
});

ipcMain.on('change-wallpaper', (_e, filePath) => {
  changeWallpaper(filePath);
});

ipcMain.on('load-setting', (e) => {
  e.sender.send('store', {
    token: (store.value.token || ''),
    channels: (store.value.channels || []),
  });
});

ipcMain.on('save-setting', (_e, params) => {
  const {
    token,
    channels,
  } = params;

  if (token === store.value.token &&
    channels.toString() === store.value.channels.toString()) return;

  store.value.token = token;
  store.value.channels = channels;
  store.save().then(() => {
    startWatchingSlack();
  });
});
