const lodash = require("lodash");

const areSameIds = (a = [], b = []) => lodash.isEqual(a.map(String).sort(), b.map(String).sort());
module.exports = areSameIds;
