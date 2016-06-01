var subscribers = [];

function getByPath(path, state, forcePath) {
  var currentPath = state;
  for (var x = 0; x < path.length; x++) {
    var key = path[x];
    if (forcePath && currentPath[key] === undefined) {
      var newBranch = {};
      Object.defineProperty(newBranch, '.referencePaths', {
        writable: true,
        configurable: true,
        value: [path.slice().splice(0, x + 1)]
      });
      currentPath[key] = newBranch;
    }
    if (currentPath[key] === undefined) {
      return currentPath[key];
    }
    currentPath = currentPath[key];
  }
  return currentPath;
}

function cleanReferences(rootObj, state, originPath) {
  if (typeof rootObj !== 'object' && rootObj !== null) {
    return;
  }

  function removeReferences(references, originPath) {
    references.forEach(function (reference) {
      var obj = reference.reduce(function (currentPath, key) {
        if (typeof key === 'string') {
          return currentPath[key];
        } else {
          return currentPath[key[0].indexOf(key[1])];
        }
      }, state);
      obj['.referencePaths'] = obj['.referencePaths'].filter(function (currentReference) {
        return currentReference.map(function (key) {
          if (typeof key === 'string' || typeof key === 'number') {
            return key
          } else {
            return key[0].indexOf(key[1]);
          }
        }).join('.') !== originPath.join('.'); // Might be slow on large arrays
      });
    });
  }
  function traverse(obj, currentPath) {
    if (Array.isArray(obj)) {
      if (obj['.referencePaths']) {
        obj.forEach(function (item, index) {
          currentPath.push(index);
          traverse(item, currentPath);
          currentPath.pop();
        });
        removeReferences(obj['.referencePaths'], currentPath);
        if (!obj['.referencePaths'].length) {
          delete obj['.referencePaths'];
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      if (obj['.referencePaths']) {
        Object.keys(obj).forEach(function (key) {
          currentPath.push(key);
          traverse(obj[key], currentPath);
          currentPath.pop();
        });
        removeReferences(obj['.referencePaths'], currentPath);
        if (!obj['.referencePaths'].length) {
          delete obj['.referencePaths'];
        }
      }
    }
  }

  traverse(rootObj, originPath);
}

function setReferences(rootObj, basePath) {
  function traverse(obj, path) {
    if (Array.isArray(obj)) {
      Object.defineProperty(obj, '.referencePaths', {
        writable: true,
        configurable: true,
        value: obj['.referencePaths'] ? obj['.referencePaths'].concat([path.slice()]) : [path.slice()]
      });
      obj.forEach(function (item, index) {
        path.push([obj, item]);
        traverse(item, path);
        path.pop();
      });
      return obj;
    } else if (typeof obj === 'object' && obj !== null) {
      Object.defineProperty(obj, '.referencePaths', {
        writable: true,
        configurable: true,
        value: obj['.referencePaths'] ? obj['.referencePaths'].concat([path.slice()]) : [path.slice()]
      });
      Object.keys(obj).forEach(function (key) {
        path.push(key);
        traverse(obj[key], path);
        path.pop(key);
      });
      return obj;
    }

    return obj;
  }
  return traverse(rootObj, basePath);
}

function StateTree(initialState) {
  var state = setReferences(initialState, []);
  var changes = {};

  function updateChanges(host, key) {
    function update(pathArray) {
      return function (currentPath, key, index) {
        if (Array.isArray(key)) {
          key = key[0].indexOf(key[1]);
          currentPath[key] = index === pathArray.length - 1 ? true : {};
        } else if (index === pathArray.length - 1 && !currentPath[key]) {
          currentPath[key] = true;
        } else if (index < pathArray.length - 1) {
          currentPath[key] = typeof currentPath[key] === 'object' ? currentPath[key] : {};
        }
        return currentPath[key];
      }
    }
    host['.referencePaths'].forEach(function (path) {
      var pathArray = path ? path.concat(key) : [key];
      pathArray.reduce(update(pathArray), changes);
    });
  }

  return {
    get: function (path) {
      path = path ? typeof path === 'string' ? path.split('.') : path : [];
      return getByPath(path, state);
    },
    set: function (path, value) {
      var pathArray = typeof path === 'string' ? path.split('.') : path;
      var originalPath = pathArray.slice();
      var key = pathArray.pop();
      var host = getByPath(pathArray, state, true);
      cleanReferences(host[key], state, originalPath);
      host[key] = setReferences(value, pathArray.concat(key));
      updateChanges(host, key);
    },
    push: function (path, value) {
      var pathArray = typeof path === 'string' ? path.split('.') : path;
      var key = pathArray.pop();
      var host = getByPath(pathArray, state);
      var length = host[key].push(setReferences(value, pathArray.concat(key, [[host[key], value]])));
      updateChanges(host[key], String(length - 1), path);
    },
    unshift: function (path, value) {
      var pathArray = typeof path === 'string' ? path.split('.') : path.slice();
      var key = pathArray.pop();
      var host = getByPath(pathArray, state);
      var length = host[key].unshift(setReferences(value, pathArray.concat(key, [[host[key], value]])));
      updateChanges(host[key], String(0));
    },
    unset: function (path) {
      var pathArray = typeof path === 'string' ? path.split('.') : path;
      var originalPath = pathArray.slice();
      var key = pathArray.pop();
      var host = getByPath(pathArray, state);
      cleanReferences(host[key], state, originalPath);
      delete host[key];
      updateChanges(host, key);
    },
    shift: function (path) {
      var pathArray = typeof path === 'string' ? path.split('.') : path.slice();
      var originalPath = pathArray.slice();
      var key = pathArray.pop();
      var host = getByPath(pathArray, state);
      cleanReferences(host[key][0], state, originalPath.concat(0));
      host[key].shift();
      updateChanges(host[key], String(0));
    },
    splice: function () {
      var args = [].slice.call(arguments);
      var path = args.shift();
      var fromIndex = args.shift();
      var length = args.shift();
      var pathArray = typeof path === 'string' ? path.split('.') : path;
      var originalPath = pathArray.slice();
      var key = pathArray.pop();
      var host = getByPath(pathArray, state);
      // Clear references on existing items and set update path
      for (var x = fromIndex; x < fromIndex + length; x++) {
        cleanReferences(host[key][x], state, originalPath.slice().concat(x));
        updateChanges(host[key], String(x));
      }
      host[key].splice.apply(host[key], [fromIndex, length].concat(args.map(function (arg) {
        return setReferences(arg, pathArray.slice().concat(key, [[host[key], arg]]));
      })));
    },
    pop: function (path) {
      var pathArray = typeof path === 'string' ? path.split('.') : path.slice();
      var originalPath = pathArray.slice();
      var key = pathArray.pop();
      var host = getByPath(pathArray, state);
      var lastIndex = host[key].length - 1;
      cleanReferences(host[key][lastIndex], state, originalPath.concat(lastIndex));
      host[key].pop();
      updateChanges(host[key], String(lastIndex));
    },
    merge: function () {
      var path;
      var value;
      if (arguments.length === 1) {
        path = '';
        value = arguments[0];
      } else {
        path = arguments[0];
        value = arguments[1];
      }
      var pathArray = typeof path === 'string' ? path.split('.') : path.slice();
      var originalPath = pathArray.slice();
      var key = pathArray.pop();
      var host = getByPath(pathArray, state, true);
      var child = host[key] || host;
      Object.keys(value).forEach(function (mergeKey) {
        cleanReferences(child[mergeKey], state, key ? originalPath.slice().concat(mergeKey) : [mergeKey]);
        child[mergeKey] = setReferences(value[mergeKey], key ? pathArray.slice().concat(key, mergeKey) : [mergeKey]);
        updateChanges(child, mergeKey);
      });
    },
    concat: function () {
      var args = [].slice.call(arguments);
      var path = args.shift();
      var pathArray = typeof path === 'string' ? path.split('.') : path.slice();
      var key = pathArray.pop();
      var host = getByPath(pathArray, state);
      host[key] = host[key].concat.apply(host[key], args.map(function (arg) {
        return setReferences(arg, pathArray.slice().concat(key, [[host[key], arg]]));
      }));
      updateChanges(host, key);
    },
    import: function (value) {
      function deepmerge(target, src) {
        var array = Array.isArray(src);
        var dst = array && [] || {};

        if (array) {
          target = target || [];
          dst = src.slice();
          src.forEach(function(e, i) {
          if (typeof dst[i] === 'undefined') {
            dst[i] = e;
          } else if (typeof e === 'object') {
            dst[i] = deepmerge(target[i], e);
          }
         });
        } else {
          if (target && typeof target === 'object') {
            Object.keys(target).forEach(function (key) {
              dst[key] = target[key];
            })
          }

          Object.keys(src).forEach(function (key) {
            if (typeof src[key] !== 'object' || !src[key]) {
              dst[key] = src[key];
            } else {
              if (!target[key]) {
                dst[key] = src[key];
              } else {
                dst[key] = deepmerge(target[key], src[key]);
              }
            }
          });
        }

        return dst;
      };
      cleanReferences(state, state, []);
      state = deepmerge(state, value);
      Object.keys(state).forEach(function (key) {
        state[key] = setReferences(state[key], [key]);
      });
    },
    subscribe: function (cb) {
      subscribers.push(cb);
    },
    unsubscribe: function (cb) {
      subscribers.splice(subscribers.indexOf(cb), 1);
    },
    flushChanges: function() {
      var flushedChanges = changes;
      changes = {};
      subscribers.forEach(function (cb) {
        cb(flushedChanges);
      });
      return flushedChanges;
    },
  };
};

function hasChanged(path, changes) {
  return path.split('.').reduce(function (changes, key) {
    return changes ? changes[key] : false;
  }, changes);
}

StateTree.computed = function (deps, cb) {
  var computedHasChanged = true;
  var value = null;
  return {
    get: function (passedState) {
      if (computedHasChanged) {
        computedHasChanged = false;
        value = cb(Object.keys(deps).reduce(function (props, key) {
          if (typeof deps[key] === 'string') {
            var path = deps[key].split('.');
            props[key] = getByPath(path, passedState);
          } else {
            props[key] = deps[key].get(passedState);
          }
          return props;
        }, {}));
        return value;
      } else {
        return value;
      }
    },
    // Can optimize by remembering the changes in case multiple
    // components checks the computed, but very unlikely
    hasChanged: function (changes) {
      if (computedHasChanged) {
        return true;
      }
      for (var key in deps) {
        if (
          (typeof deps[key] === 'string' && hasChanged(deps[key], changes)) ||
          (typeof deps[key] !== 'string' && deps[key].hasChanged(changes))
        ) {
          computedHasChanged = true;
          return true;
        }
      }
      return false;
    }
  }
}

module.exports = StateTree;
