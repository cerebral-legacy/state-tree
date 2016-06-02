import { getByPath, hasChanged } from './utils'

class Computed {
  static getByPath
  static hasChanged
  private _value
  private _computedHasChanged

  constructor (private _deps, private _cb) {
    if (!(this instanceof Computed)) return new Computed(_deps, _cb)

    this._computedHasChanged = true
    this._value = null
    this._deps = _deps
  }

  getDepsMap () {
    return this._deps
  }

  get (passedState) {
    if (this._computedHasChanged) {
      this._computedHasChanged = false
      this._value = this._cb(Object.keys(this._deps).reduce((props, key) => {
        if (typeof this._deps[key] === 'string') {
          var path = this._deps[key].split('.')
          props[key] = Computed.getByPath(path, passedState)
        } else {
          props[key] = this._deps[key].get(passedState)
        }
        return props
      }, {}))
      return this._value
    } else {
      return this._value
    }
  }

  // Can optimize by remembering the changes in case multiple
  // components checks the computed, but very unlikely
  hasChanged (changes) {
    if (this._computedHasChanged) {
      return true
    }
    for (var key in this._deps) {
      if (
        (typeof this._deps[key] === 'string' && Computed.hasChanged(this._deps[key], changes)) ||
        (typeof this._deps[key] !== 'string' && this._deps[key].hasChanged(changes))
      ) {
        this._computedHasChanged = true
        return true
      }
    }
    return false
  }
}

Computed.getByPath = getByPath
Computed.hasChanged = hasChanged

export default Computed
