const {
  ipcRenderer,
  nativeImage,
} = require('electron');
const fs = require('fs');
const path = require('path');
const genFileName = require('../lib/gen-filename.js');
const convertURL = require('../lib/convert-url.js');

const MAX_PICTURE_SIZE = 640;

let canvas;
let wallpaperDirPath;
let oldWallpaperPath;

function initCanvas(width = 1920, height = 1080) {
  canvas = document.createElement('canvas');
  canvas.setAttribute('width', width);
  canvas.setAttribute('height', height);
}

function findNewestWallpaper() {
  return new Promise((resolve) => {
    fs.readdir(wallpaperDirPath, (err, files) => {
      if (err) throw err;
      const list = files
        .sort()
        .filter(file => fs.statSync(path.join(wallpaperDirPath, file)).isFile() && file.endsWith('.png'));
      resolve(path.join(wallpaperDirPath, list[list.length - 1] || 'dummy.png'));
    });
  });
}

function load() {
  const context = canvas.getContext('2d');
  context.fillStyle = 'rgb(255, 255, 255)';
  context.fillRect(0, 0, Math.floor(canvas.getAttribute('width')), Math.floor(canvas.getAttribute('height')));

  return findNewestWallpaper()
    .then(wallpaperPath => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.drawImage(img, 0, 0);
        oldWallpaperPath = wallpaperPath;
        resolve();
      };
      img.onerror = resolve;
      img.src = wallpaperPath;
    }));
}

function save() {
  const image = nativeImage.createFromDataURL(canvas.toDataURL());
  return new Promise((resolve) => {
    const wallpaperPath = path.join(wallpaperDirPath, genFileName());
    fs.writeFile(wallpaperPath, image.toPng(), (err) => {
      if (err) throw err;
      if (oldWallpaperPath) fs.unlink(oldWallpaperPath);
      oldWallpaperPath = wallpaperPath;
      resolve(wallpaperPath);
    });
  });
}

function draw(pictureURL) {
  const w = Math.floor(canvas.getAttribute('width'));
  const h = Math.floor(canvas.getAttribute('height'));
  const context = canvas.getContext('2d');
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.translate(Math.floor(Math.random() * w), Math.floor(Math.random() * h));
      context.rotate((Math.random() - 0.5) * 1.5);
      const per = Math.max(img.width / MAX_PICTURE_SIZE, img.height / MAX_PICTURE_SIZE, 1);
      const renderWidth = img.width / per;
      const renderHeight = img.height / per;
      context.drawImage(img, -renderWidth / 2, -renderHeight / 2, renderWidth, renderHeight);
      resolve();
    };
    img.onerror = reject;
    img.src = pictureURL;
  });
}

(() => {
  ipcRenderer.on('load', (_e, newWallpaperDirPath) => {
    wallpaperDirPath = newWallpaperDirPath;
    load()
      .then(() => save())
      .then((newPath) => {
        ipcRenderer.send('change-wallpaper', newPath);
      })
      .catch((e) => {
        console.error(e);
      });
  });
  ipcRenderer.on('draw', (_e, pictureURL) => {
    convertURL(pictureURL)
      .then((customizedURL) => draw(customizedURL))
      .then(() => save())
      .then((newPath) => {
        ipcRenderer.send('change-wallpaper', newPath);
      })
      .catch((e) => {
        console.error(e);
      });
  });

  initCanvas();
  ipcRenderer.send('worker-inited');
})();
