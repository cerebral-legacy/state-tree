import { setReferences, cleanReferences } from './references'
import { deepmerge, getByPath } from './utils'

export type Callback = (changes: any) => void

class StateTree {
  private _state: any
  private _subscribers: Callback[]
  private _changes: any
  static setReferences
  static cleanReferences
  static getByPath

  constructor (initialState: any) {
    if (!(this instanceof StateTree)) return new StateTree(initialState)

    this._state = StateTree.setReferences(initialState, [])
    this._changes = {}
    this._subscribers = []
  }
  
  private _updateChanges(host, key) {
    function update(pathArray) {
      return function (currentPath, key, index) {
        if (Array.isArray(key)) {
          key = key[0].indexOf(key[1])
          currentPath[key] = index === pathArray.length - 1 ? true : {}
        } else if (index === pathArray.length - 1 && !currentPath[key]) {
          currentPath[key] = true
        } else if (index < pathArray.length - 1) {
          currentPath[key] = typeof currentPath[key] === 'object' ? currentPath[key] : {}
        }
        return currentPath[key]
      }
    }
    host['.referencePaths'].forEach((path) => {
      var pathArray = path ? path.concat(key) : [key]
      pathArray.reduce(update(pathArray), this._changes)
    })
  }

  get (path) {
    path = path ? typeof path === 'string' ? path.split('.') : path : []
    return StateTree.getByPath(path, this._state)
  }

  set (path, value) {
    var pathArray = typeof path === 'string' ? path.split('.') : path
    var originalPath = pathArray.slice()
    var key = pathArray.pop()
    var host = StateTree.getByPath(pathArray, this._state, true)
    StateTree.cleanReferences(host[key], this._state, originalPath)
    host[key] = StateTree.setReferences(value, pathArray.concat(key))
    this._updateChanges(host, key)
  }

  push (path, value) {
    var pathArray = typeof path === 'string' ? path.split('.') : path
    var key = pathArray.pop()
    var host = StateTree.getByPath(pathArray, this._state)
    var length = host[key].push(setReferences(value, pathArray.concat(key, [[host[key], value]])))
    this._updateChanges(host[key], String(length - 1))
  }

  unshift (path, value) {
    var pathArray = typeof path === 'string' ? path.split('.') : path.slice()
    var key = pathArray.pop()
    var host = StateTree.getByPath(pathArray, this._state)
    var length = host[key].unshift(setReferences(value, pathArray.concat(key, [[host[key], value]])))
    this._updateChanges(host[key], String(0))
  }

  unset (path) {
    var pathArray = typeof path === 'string' ? path.split('.') : path
    var originalPath = pathArray.slice()
    var key = pathArray.pop()
    var host = StateTree.getByPath(pathArray, this._state)
    StateTree.cleanReferences(host[key], this._state, originalPath)
    delete host[key]
    this._updateChanges(host, key)
  }

  shift (path) {
    var pathArray = typeof path === 'string' ? path.split('.') : path.slice()
    var originalPath = pathArray.slice()
    var key = pathArray.pop()
    var host = StateTree.getByPath(pathArray, this._state)
    cleanReferences(host[key][0], this._state, originalPath.concat(0))
    host[key].shift()
    this._updateChanges(host[key], String(0))
  }

  splice () {
    var args = [].slice.call(arguments)
    var path = args.shift()
    var fromIndex = args.shift()
    var length = args.shift()
    var pathArray = typeof path === 'string' ? path.split('.') : path
    var originalPath = pathArray.slice()
    var key = pathArray.pop()
    var host = StateTree.getByPath(pathArray, this._state)
    // Clear references on existing items and set update path
    for (var x = fromIndex; x < fromIndex + length; x++) {
      cleanReferences(host[key][x], this._state, originalPath.slice().concat(x))
      this._updateChanges(host[key], String(x))
    }
    host[key].splice.apply(host[key], [fromIndex, length].concat(args.map(function (arg) {
      return setReferences(arg, pathArray.slice().concat(key, [[host[key], arg]]))
    })))
  }

  pop (path) {
    var pathArray = typeof path === 'string' ? path.split('.') : path.slice()
    var originalPath = pathArray.slice()
    var key = pathArray.pop()
    var host = StateTree.getByPath(pathArray, this._state)
    var lastIndex = host[key].length - 1
    cleanReferences(host[key][lastIndex], this._state, originalPath.concat(lastIndex))
    host[key].pop()
    this._updateChanges(host[key], String(lastIndex))
  }

  merge () {
    var path
    var value
    if (arguments.length === 1) {
      path = ''
      value = arguments[0]
    } else {
      path = arguments[0]
      value = arguments[1]
    }
    var pathArray = typeof path === 'string' ? path.split('.') : path.slice()
    var originalPath = pathArray.slice()
    var key = pathArray.pop()
    var host = StateTree.getByPath(pathArray, this._state, true)
    var child = host[key] || host
    Object.keys(value).forEach((mergeKey) => {
      cleanReferences(child[mergeKey], this._state, key ? originalPath.slice().concat(mergeKey) : [mergeKey])
      child[mergeKey] = setReferences(value[mergeKey], key ? pathArray.slice().concat(key, mergeKey) : [mergeKey])
      this._updateChanges(child, mergeKey)
    })
  }

  concat () {
    var args = [].slice.call(arguments)
    var path = args.shift()
    var pathArray = typeof path === 'string' ? path.split('.') : path.slice()
    var key = pathArray.pop()
    var host = StateTree.getByPath(pathArray, this._state)
    host[key] = host[key].concat.apply(host[key], args.map(function (arg) {
      return setReferences(arg, pathArray.slice().concat(key, [[host[key], arg]]))
    }))
    this._updateChanges(host, key)
  }

  import (value) {
    StateTree.cleanReferences(this._state, this._state, [])
    this._state = deepmerge(this._state, value)
    Object.keys(this._state).forEach((key) => {
      this._state[key] = setReferences(this._state[key], [key])
    })
  }

  subscribe (cb) {
    this._subscribers.push(cb)
  }

  unsubscribe (cb) {
    this._subscribers.splice(this._subscribers.indexOf(cb), 1)
  }

  flushChanges () {
    var flushedChanges = this._changes
    this._changes = {}
    this._subscribers.forEach(function (cb) {
      cb(flushedChanges)
    })
    return flushedChanges
  }
}

StateTree.setReferences = setReferences
StateTree.cleanReferences = cleanReferences
StateTree.getByPath = getByPath 

export default StateTree
