import lodashClone from 'lodash/clone'
import lodashToPath from 'lodash/toPath'

export function cloneSetCommon (source, path, cb) {
  const pathBits = lodashToPath(path)
  const newRoot = lodashClone(source)
  let x = newRoot

  while (pathBits.length > 1) {
    const index = pathBits.shift()

    let sub
    if (x[index] == null) {
      // missing!
      // like lodashSet, stuff something suitable in..
      if (index === '0') {
        throw new Error("cloneSet: won't autocreate array")
      }
      sub = {}
    } else {
      // object/array is present as expected
      sub = lodashClone(x[index])
    }

    x[index] = sub
    x = sub
  }

  // let the callback deal with the very last part
  cb(x, pathBits[0])

  return newRoot
}

// set a value at path on an immutable object hierarchy
// - cloning where necessary!
export function cloneSet (source, path, value) {
  return cloneSetCommon(source, path, (parent, lastPath) => {
    parent[lastPath] = value
  })
}

// set a key to value on an Object at 'path', in an immutable object
// hierarchy - cloning where necessary!
export function cloneSetKV (source, path, key, value) {
  return cloneSetCommon(source, path, (parent, lastPath) => {
    const lastObj = parent[lastPath] ? lodashClone(parent[lastPath]) : {}
    lastObj[key] = value
    parent[lastPath] = lastObj
  })
}

export function cloneArrayPush (source, path, pushValue) {
  return cloneSetCommon(source, path, (parent, lastPath) => {
    const arr = parent[lastPath] ? lodashClone(parent[lastPath]) : []
    arr.push(pushValue)
    parent[lastPath] = arr
  })
}
