function convertURL(originalUrl) {
  if (originalUrl.startsWith('http://lohas.nicoseiga.jp/thumb/')) {
    return Promise.resolve(originalUrl.replace(/(\d+)[a-z](?:\?.+)?$/, '$1i'));
  } else {
    return Promise.resolve(originalUrl);
  }
}

module.exports = convertURL;
