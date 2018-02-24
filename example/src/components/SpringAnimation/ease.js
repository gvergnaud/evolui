import {Observable} from 'rxjs/Observable'

const secondPerFrame = 0.016

// stepper :: Number -> Number -> Number -> Number? -> Number? -> Number? -> [Number, Number]
let reusedTuple = [0, 0]
function stepper(
  value,
  velocity,
  destValue,
  stiffness = 170,
  damping = 20,
  precision = 0.1
) {
  // Spring stiffness, in kg / s^2

  // for animations, destValue is really spring length (spring at rest). initial
  // position is considered as the stretched/compressed position of a spring
  const Fspring = -stiffness * (value - destValue)

  // Damping, in kg / s
  const Fdamper = -damping * velocity

  // usually we put mass here, but for animation purposes, specifying mass is a
  // bit redundant. you could simply adjust k and b accordingly
  // let a = (Fspring + Fdamper) / mass
  const a = Fspring + Fdamper

  const newVelocity = velocity + a * secondPerFrame
  const newValue = value + newVelocity * secondPerFrame

  if (
    Math.abs(newVelocity) < precision &&
    Math.abs(newValue - destValue) < precision
  ) {
    reusedTuple[0] = destValue
    reusedTuple[1] = 0
    return reusedTuple
  }

  reusedTuple[0] = newValue
  reusedTuple[1] = newVelocity
  return reusedTuple
}

const rafThrottle = f => {
  var shouldExecute = true
  return (...args) => {
    if (!shouldExecute) return
    shouldExecute = false

    window.requestAnimationFrame(() => {
      shouldExecute = true
      f.apply(f, args)
    })
  }
}

const ease = (stiffness, damping) => {
  let value
  let velocity = 0
  let destValue

  let i = 0
  return x => {
    destValue = x
    if (value === undefined) value = x

    return new Observable(observer => {
      let isRunning = true

      const run = rafThrottle(() => {
        [value, velocity] = stepper(
          value,
          velocity,
          destValue,
          stiffness,
          damping
        )

        observer.next(value)
        if (velocity !== 0 && isRunning) run()
      })

      run()

      return {
        unsubscribe() {
          isRunning = false
        }
      }
    })
  }
}


export default ease
