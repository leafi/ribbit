import lodashClone from 'lodash/clone'
import { cloneSet, cloneSetCommon, cloneSetKV } from './cloneSet'

// cloneSet but with a value func
function cloneSetFn (source, path, valueFn, selectorArgs) {
  return cloneSetCommon(source, path, (parent, lastPath) => {
    parent[lastPath] = valueFn(
      {
        path,
        source,
        state: source,
        value: parent[lastPath]
      },
      ...selectorArgs
    )
  })
}

// cloneSetKV but with a key func & a value func
function cloneSetKVFn (source, path, keyFn, valueFn, selectorArgs) {
  return cloneSetCommon(source, path, (parent, lastPath) => {
    const lastObj = parent[lastPath] ? lodashClone(parent[lastPath]) : {}

    const key = keyFn(
      {
        container: parent[lastPath],
        path,
        source,
        state: source
      },
      ...selectorArgs
    )

    lastObj[key] = valueFn(
      {
        container: parent[lastPath],
        key,
        path,
        source,
        state: source,
        value: parent[lastPath][key]
      },
      ...selectorArgs
    )

    parent[lastPath] = lastObj
  })
}

export const writeSelector = (path, valueOrValueFn) => {
  if (valueOrValueFn && typeof valueOrValueFn === 'function') {
    return (state, ...selectorArgs) =>
      cloneSetFn(state, path, valueOrValueFn, selectorArgs)
  }
  return state => cloneSet(state, path, valueOrValueFn)
}

export const writeSelectorKV = (path, keyOrKeyFn, valueOrValueFn) => {
  const wasKeyFn = keyOrKeyFn && typeof keyOrKeyFn === 'function'
  const wasValueFn = valueOrValueFn && typeof valueOrValueFn === 'function'

  if (!wasKeyFn && !wasValueFn) {
    // simple case
    return state => cloneSetKV(state, path, keyOrKeyFn, valueOrValueFn)
  }

  // force both to be functions
  const keyFn = wasKeyFn ? keyOrKeyFn : () => keyOrKeyFn
  const valueFn = wasValueFn ? valueOrValueFn : () => valueOrValueFn

  return (state, ...selectorArgs) =>
    cloneSetKVFn(state, path, keyFn, valueFn, selectorArgs)
}
