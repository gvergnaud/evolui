import { Subject, scan, startWith, shareReplay } from './utils/observables'
import { mapValues } from './utils/objects'

const createMutable = initialValue => {
  const sub = new Subject()
  const stream = sub.pipe(
    scan((acc, f) => f(acc), initialValue),
    startWith(initialValue),
    shareReplay(1)
  )

  stream.set = x => sub.next(typeof x === 'function' ? x : () => x)

  return stream
}

export default function createState(initialState) {
  return mapValues(createMutable, initialState)
}
