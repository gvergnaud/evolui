export const zip = (xs, ys) => {
  const [longest, shortest] = [xs, ys].sort((a, b) => b.length - a.length)
  return longest.reduce((acc, x, i) => [...acc, x, shortest[i]], [])
}
