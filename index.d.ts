import StateTree from './lib/stateTree'
import Computed from './lib/computed'

interface StateTreeFactory {
  (initialState): StateTree
  computed: (deps: any, cb: any) => Computed
}

declare const stateTree: StateTreeFactory

export = stateTree 
