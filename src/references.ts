export function cleanReferences(rootObj, state, originPath) {
  if (typeof rootObj !== 'object' && rootObj !== null) {
    return
  }

  function removeReferences(references, originPath) {
    references.forEach(function (reference) {
      var obj = reference.reduce(function (currentPath, key) {
        if (typeof key === 'string') {
          return currentPath[key]
        } else {
          return currentPath[key[0].indexOf(key[1])]
        }
      }, state)
      obj['.referencePaths'] = obj['.referencePaths'].filter(function (currentReference) {
        return currentReference.map(function (key) {
          if (typeof key === 'string' || typeof key === 'number') {
            return key
          } else {
            return key[0].indexOf(key[1])
          }
        }).join('.') !== originPath.join('.') // Might be slow on large arrays
      })
    })
  }
  function traverse(obj, currentPath) {
    if (Array.isArray(obj)) {
      if (obj['.referencePaths']) {
        obj.forEach(function (item, index) {
          currentPath.push(index)
          traverse(item, currentPath)
          currentPath.pop()
        })
        removeReferences(obj['.referencePaths'], currentPath)
        if (!obj['.referencePaths'].length) {
          delete obj['.referencePaths']
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      if (obj['.referencePaths']) {
        Object.keys(obj).forEach(function (key) {
          currentPath.push(key)
          traverse(obj[key], currentPath)
          currentPath.pop()
        })
        removeReferences(obj['.referencePaths'], currentPath)
        if (!obj['.referencePaths'].length) {
          delete obj['.referencePaths']
        }
      }
    }
  }

  traverse(rootObj, originPath)
}

export function setReferences(rootObj, basePath) {
  function traverse(obj, path) {
    if (Array.isArray(obj)) {
      Object.defineProperty(obj, '.referencePaths', {
        writable: true,
        configurable: true,
        value: obj['.referencePaths'] ? obj['.referencePaths'].concat([path.slice()]) : [path.slice()]
      })
      obj.forEach(function (item, index) {
        path.push([obj, item])
        traverse(item, path)
        path.pop()
      })
      return obj
    } else if (typeof obj === 'object' && obj !== null) {
      Object.defineProperty(obj, '.referencePaths', {
        writable: true,
        configurable: true,
        value: obj['.referencePaths'] ? obj['.referencePaths'].concat([path.slice()]) : [path.slice()]
      })
      Object.keys(obj).forEach(function (key) {
        path.push(key)
        traverse(obj[key], path)
        path.pop(key)
      })
      return obj
    }

    return obj
  }
  return traverse(rootObj, basePath)
}
