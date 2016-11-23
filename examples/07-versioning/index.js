module.exports = class Main {
  constructor () {
    this.isMain = true;
  }
  toString () {
    console.log(`Main instance: ${this.isMain}`);
  }
};