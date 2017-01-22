const osascript = require('osascript').eval;

function generateJXACode(path) {
  return `
var se = Application("System Events");
var path = '${path}';
se.desktops().forEach((desktop) => {
    desktop.pictureRotation = 0;
    desktop.picture.set(path);
});
`;
}

function changeWallPaper(path) {
  const code = generateJXACode(path);
  return new Promise((resolve, reject) => {
    osascript(code, (err, data) => (err ? reject(err) : resolve(data)));
  });
}

module.exports = changeWallPaper;
