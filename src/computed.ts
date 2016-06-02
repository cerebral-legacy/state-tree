import { getByPath } from './utils'

class Computed {
  static getByPath
  private _deps
  private _cb

  constructor (_deps, _cb) {
    if (!(this instanceof Computed)) return new Computed(_deps, _cb)
    this._deps = _deps
    this._cb = _cb
  }

  getDepsMap () {
    return this._deps
  }

  get (passedState) {
    return this._cb(Object.keys(this._deps).reduce((props, key) => {
      if (typeof this._deps[key] === 'string') {
        var path = this._deps[key].split('.')
        props[key] = Computed.getByPath(path, passedState)
      } else {
        props[key] = this._deps[key].get(passedState)
      }
      return props
    }, {}))
  }

}

Computed.getByPath = getByPath

export default Computed
