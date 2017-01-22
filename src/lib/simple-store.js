const fs = require('fs');
const path = require('path');
const getPath = require('./get-path.js');

class SimpleStore {
  constructor(name) {
    this._name = `${name}.json`;
    this._value = {};
  }

  get value() {
    return this._value;
  }

  getJsonPath() {
    return path.join(getPath(), this._name);
  }

  load() {
    return new Promise((resolve) => {
      fs.readFile(this.getJsonPath(), (err, resp) => {
        try {
          if (err) throw err;
          this._value = JSON.parse(resp);
          resolve();
        } catch (_e) {
          this._value = {};
          resolve();
        }
      });
    });
  }

  save() {
    return new Promise((resolve) => {
      fs.writeFile(this.getJsonPath(), JSON.stringify(this._value), (err) => {
        if (err) throw err;
        resolve();
      });
    });
  }
}

module.exports = SimpleStore;
