// no easing, no acceleration
module.exports.linear = t => t

// accelerating from zero velocity
module.exports.easeInQuad = t => t * t

// decelerating to zero velocity
module.exports.easeOutQuad = t => t * (2 - t)

// acceleration until halfway, then deceleration
module.exports.easeInOutQuad = t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)

// accelerating from zero velocity
module.exports.easeInCubic = t => t * t * t

// decelerating to zero velocity
module.exports.easeOutCubic = t => --t * t * t + 1

// acceleration until halfway, then deceleration
module.exports.easeInOutCubic = t =>
  t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1

// accelerating from zero velocity
module.exports.easeInQuart = t => t * t * t * t

// decelerating to zero velocity
module.exports.easeOutQuart = t => 1 - --t * t * t * t

// acceleration until halfway, then deceleration
module.exports.easeInOutQuart = t =>
  t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t

// accelerating from zero velocity
module.exports.easeInQuint = t => t * t * t * t * t

// decelerating to zero velocity
module.exports.easeOutQuint = t => 1 + --t * t * t * t * t

// acceleration until halfway, then deceleration
module.exports.easeInOutQuint = t =>
  t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t
