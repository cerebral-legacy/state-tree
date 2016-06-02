// class factories exported as CommonJS module "default"
var StateTree = require('./lib/stateTree').default
var Computed = require('./lib/computed').default

module.exports = function (initialState) {
  return new StateTree(initialState)
}

module.exports.computed = function (deps, cb) {
  return new Computed(deps, cb)
}
