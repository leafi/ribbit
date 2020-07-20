import lodashClone from 'lodash/clone'
import {
  cloneSet,
  cloneSetCommon,
  cloneSetKV
} from './cloneSet'

// cloneSet but with a value function
function cloneSetValueFn (source, path, valueFn, sendExtraValueFnArgs) {
  return cloneSetCommon(source, path, (parent, lastPath) => {
    let valueFn2ndArg
    if (sendExtraValueFnArgs) {
      valueFn2ndArg = {
        path: source,
        source,
        state: source
      }
    }

    parent[lastPath] = valueFn(parent[lastPath], valueFn2ndArg)
  })
}

// cloneSetKV but with a value function
function cloneSetKValueFn (source, path, key, valueFn, sendExtraValueFnArgs) {
  return cloneSetCommon(source, path, (parent, lastPath) => {
    const lastObj = parent[lastPath] ? lodashClone(parent[lastPath]) : {}

    let valueFn2ndArg
    if (sendExtraValueFnArgs) {
      valueFn2ndArg = {
        container: lastObj,
        key,
        path,
        source,
        state: source
      }
    }

    lastObj[key] = valueFn(parent[lastPath][key], valueFn2ndArg)
    parent[lastPath] = lastObj
  })
}

export const writeSelector = (path, valOrValFn, opts) => {
  if (valOrValFn && (typeof valOrValFn === 'function')) {
    const valFnArgs = opts && opts.valFnArgs != null ? opts.valFnArgs : 1

    if (valFnArgs < 1) {
      const oldValFn = valOrValFn
      valOrValFn = () => oldValFn()
    }

    return (state) => cloneSetValueFn(state, path, valOrValFn, valFnArgs > 1)
  }

  return (state) => cloneSet(state, path, valOrValFn)
}

export const writeSelectorKV = (path, keyOrKeyFn, valOrValFn, opts) => {
  const isKeyFn = keyOrKeyFn && (typeof keyOrKeyFn === 'function')
  const isValFn = valOrValFn && (typeof valOrValFn === 'function')

  const keyFnArgs = opts && opts.keyFnArgs != null ? opts.keyFnArgs : 1
  const valFnArgs = opts && opts.valFnArgs != null ? opts.valFnArgs : 1

  let cloneSetKVFun = cloneSetKV

  if (isValFn) {
    cloneSetKVFun = cloneSetKValueFn

    if (valFnArgs < 1) {
      const oldValFn = valOrValFn
      valOrValFn = () => oldValFn()
    }
  }

  if (isKeyFn) {
    if (keyFnArgs === 0) {
      return (state) => cloneSetKVFun(state, path, keyOrKeyFn(), valOrValFn, valFnArgs > 1)
    } else if (keyFnArgs === 1) {
      return (state) => cloneSetKVFun(state, path, keyOrKeyFn(state), valOrValFn, valFnArgs > 1)
    } else {
      return (state) => cloneSetKVFun(state, path, keyOrKeyFn(state, path), valOrValFn, valFnArgs > 1)
    }
  } else {
    return (state) => cloneSetKVFun(state, path, keyOrKeyFn, valOrValFn, valFnArgs > 1)
  }
}
