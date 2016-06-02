// keep backward compatibility
var StateTree = require('./lib/stateTree').default
StateTree.computed = require('./lib/computed').default

module.exports = StateTree
