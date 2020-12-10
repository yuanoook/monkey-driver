// Any thing less than 8px is not clickable
// Char `1` (font-size: 14px) is about 8.9px width
const MIN_SIZE = 8

function clickable(node) {
  let tooSmall = (
    node.offsetHeight !== undefined && node.offsetHeight < MIN_SIZE ||
    node.offsetWidth !== undefined && node.offsetWidth < MIN_SIZE
  )
  if (tooSmall) return false

  const rect = node.getBoundingClientRect()
  tooSmall = rect.width < MIN_SIZE || rect.height < MIN_SIZE
  if (tooSmall) return false

  const inViewPort = !(
    rect.right <= 0 ||
    rect.bottom <= 0 ||
    rect.top >= window.innerHeight ||
    rect.left >= window.innerWidth
  )

  return inViewPort && (
    /**
     * Check points & orders
     *  1 4 8
     *  6 2 7
     *  9 5 3
     */
    document.elementFromPoint(rect.x, rect.y) === node ||
    document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2) === node ||
    document.elementFromPoint(rect.x + rect.width - 1, rect.y + rect.height - 1) === node ||

    document.elementFromPoint(rect.x + rect.width / 2, rect.y) === node ||
    document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height - 1) === node ||

    document.elementFromPoint(rect.x, rect.y + rect.height / 2) === node ||
    document.elementFromPoint(rect.x + rect.width - 1, rect.y + rect.height / 2) === node ||

    document.elementFromPoint(rect.x + rect.width - 1, rect.y) === node ||
    document.elementFromPoint(rect.x, rect.y + rect.height - 1) === node
  )
}

module.exports = clickable
