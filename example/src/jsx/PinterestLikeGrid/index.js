import { h } from 'evolui'
import { createState } from 'evolui/extra'
import { from } from 'rxjs'
import { map, startWith, switchMap } from 'rxjs/operators'
import './index.css'
import { getLikes } from './Api'

import Select from './Select'
import Grid from './Grid'

export const memoize = f => {
  const cache = new Map()
  return params => {
    if (cache[params]) return cache[params]
    cache[params] = f(params)
    return cache[params]
  }
}

const likesFetcher = memoize(getLikes)

const SketchfabGrid = () => {
  const users = [
    { name: 'Gabriel', id: '981035ddb1d54b628b8d16200aecff13' },
    { name: 'Paul', id: 'f7b66ea8241c4ffa81cb7cee1c073894' }
  ]

  const state = createState({ userId: users[0].id })

  const models$ = state.userId.pipe(
    switchMap(userId => from(likesFetcher(userId))),
    startWith([])
  )

  return (
    <div>
      <Select
        value={state.userId}
        onChange={state.userId.set}
        options={users.map(({ name, id }) => ({ title: name, value: id }))}
      />

      {models$.pipe(map(models => <Grid models={models} />))}
    </div>
  )
}

export default SketchfabGrid
