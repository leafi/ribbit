import { getStore } from '@/store'
import { cloneArrayPush } from './cloneSet'

export {
  cloneArrayPush,
  cloneSet,
  cloneSetKV
} from './cloneSet'

export {
  writeSelector,
  writeSelectorKV
} from './writeSelectors'

export function fatalError (error, outerMessage) {
  let err2
  if (outerMessage != null) {
    console.error(`${outerMessage}\n`, error)
    err2 = { _wrappedError: true, outerMessage, error }
  } else {
    console.error(error)
    err2 = error
  }
  getStore().action(state => cloneArrayPush(state, 'view.fatalErrors', err2))()
}
