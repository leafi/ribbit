import createStore from 'unistore'
// import people from './people'

let store = null

// data owned by components/words/bd
const bdDefaultState = {}

const engineDefaultState = {
  oldMd: [],
  md: '',
  mdTmp: '',
  // people,
  prepPfx: 0,
  prep: {}
}

const prefsDefaultState = {
  smartQuotes: false
}

const storyDefaultState = {}
const viewDefaultState = {
  fatalErrors: [],
  nav: {
    page: 'mdtest'
  }
}

const defaultState = {
  bd: bdDefaultState,
  engine: engineDefaultState,
  prefs: prefsDefaultState,
  story: storyDefaultState,
  view: viewDefaultState
}

export const getStore = () => store

export const recreateStore = toMerge => {
  store = createStore(defaultState)
  if (toMerge != null) {
    store.setState(toMerge)
  }
  window.store = store
}
