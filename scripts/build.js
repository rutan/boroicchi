const fs = require('fs');
const path = require('path');
const packager = require('electron-packager');

packager({
  overwrite: true,
  arch: 'all',
  dir: path.join(__dirname, '..'),
  out: path.join(__dirname, '..', 'dist'),
  icon: path.join(__dirname, '..', 'icons', 'boroicchi'),
  ignore: [
    /\/\./,
    /\.iml$/,
    /yarn\.lock$/,
    /^\/scripts/,
  ],
}, (err, appPaths) => {
  if (err) throw err;
  const myLicense = fs.readFileSync(path.join(__dirname, '..', 'LICENSE.txt'));
  const depLicense = fs.readFileSync(path.join(__dirname, '..', 'dist', 'dependency-license.txt'));
  appPaths.forEach((distPath) => {
    fs.writeFileSync(
      path.join(distPath, 'boroicchi-license.txt'),
      `${myLicense}
# Library

${depLicense}`);
  });
  console.log('build', appPaths);
});
