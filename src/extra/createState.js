import { BehaviorSubject } from '../utils/observables'
import { mapValues } from '../utils/objects'

const createMutable = initialValue => {
  const sub = new BehaviorSubject(initialValue)
  sub.set = x => sub.next(typeof x === 'function' ? x(sub.value) : x)
  return sub
}

export default function createState(initialState) {
  return mapValues(createMutable, initialState)
}
