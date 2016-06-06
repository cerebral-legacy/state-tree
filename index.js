// class factories exported as CommonJS module "default"
var StateTree = require('./lib/stateTree').default

module.exports = function (initialState) {
  return new StateTree(initialState)
}
