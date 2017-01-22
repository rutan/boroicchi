function genFileName(ext = 'png') {
  return `${`00000000000000000${Date.now()}`.slice(-17)}.${ext}`;
}

module.exports = genFileName;
