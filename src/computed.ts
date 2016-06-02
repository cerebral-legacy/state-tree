import { getByPath } from './utils'

class Computed {
  static getByPath = getByPath
  constructor (private _deps, private _cb) { }

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

export default Computed
