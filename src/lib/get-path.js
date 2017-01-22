const {
  app,
} = require('electron');
const path = require('path');
const mkdirp = require('mkdirp');

function rootPath() {
  return path.join(app.getPath('appData'), 'boroicchi');
}

function getPath(filePath = '.') {
  const str = path.join(rootPath(), filePath);
  mkdirp.sync(str);
  return str;
}

module.exports = getPath;
