export function getByPath(path, state, forcePath?) {
  var currentPath = state
  for (var x = 0; x < path.length; x++) {
    var key = path[x]
    if (forcePath && currentPath[key] === undefined) {
      var newBranch = {}
      Object.defineProperty(newBranch, '.referencePaths', {
        writable: true,
        configurable: true,
        value: [path.slice().splice(0, x + 1)]
      })
      currentPath[key] = newBranch
    }
    if (currentPath[key] === undefined) {
      return currentPath[key]
    }
    currentPath = currentPath[key]
  }
  return currentPath
}

export function deepmerge(target, src) {
  var array = Array.isArray(src)
  var dst = array && [] || {}

  if (array) {
    target = target || []
    dst = src.slice()
    src.forEach(function(e, i) {
    if (typeof dst[i] === 'undefined') {
      dst[i] = e
    } else if (typeof e === 'object') {
      dst[i] = deepmerge(target[i], e)
    }
    })
  } else {
    if (target && typeof target === 'object') {
      Object.keys(target).forEach(function (key) {
        dst[key] = target[key]
      })
    }

    Object.keys(src).forEach(function (key) {
      if (typeof src[key] !== 'object' || !src[key]) {
        dst[key] = src[key]
      } else {
        if (!target[key]) {
          dst[key] = src[key]
        } else {
          dst[key] = deepmerge(target[key], src[key])
        }
      }
    })
  }

  return dst
}

export function hasChanged(path, changes) {
  return path.split('.').reduce(function (changes, key) {
    return changes ? changes[key] : false
  }, changes)
}