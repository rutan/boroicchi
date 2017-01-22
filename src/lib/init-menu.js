const { app, Menu, shell } = require('electron');

const template = [];

// About boroicchi
template.push({
  label: app.getName(),
  submenu: [
    {
      role: 'about',
    },
    {
      type: 'separator',
    },
    {
      role: 'services',
      submenu: [],
    },
    {
      type: 'separator',
    },
    {
      type: 'separator',
    },
    {
      role: 'quit',
    },
  ],
});

// Edit
template.push({
  label: 'Edit',
  submenu: [
    {
      role: 'undo',
    },
    {
      role: 'redo',
    },
    {
      type: 'separator',
    },
    {
      role: 'cut',
    },
    {
      role: 'copy',
    },
    {
      role: 'paste',
    },
    {
      role: 'pasteandmatchstyle',
    },
    {
      role: 'delete',
    },
    {
      role: 'selectall',
    },
  ],
});

// View (only debug)
if (process.env.NODE_ENV === 'development') {
  template.push({
    label: 'View',
    submenu: [
      {
        role: 'reload',
      },
      {
        role: 'toggledevtools',
      },
      {
        type: 'separator',
      },
      {
        role: 'resetzoom',
      },
      {
        role: 'zoomin',
      },
      {
        role: 'zoomout',
      },
      {
        type: 'separator',
      },
      {
        role: 'togglefullscreen',
      },
    ],
  });
}

// help
template.push({
  role: 'help',
  submenu: [
    {
      label: 'GitHub repository',
      click() {
        shell.openExternal('https://github.com/rutan/boroicchi');
      },
    },
  ],
});

function initMenu() {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = initMenu;
