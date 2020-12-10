const {
  fromPoint,
  getRect
} = require('./point')

// Any thing less than 8px is not clickable
// Char `1` (font-size: 14px) is about 8.9px width
const MIN_SIZE = 8

function clickableAt(node, x, y) {
  const pNode = fromPoint(x, y)
  if (!pNode) return false
  return (pNode === node) || (
    pNode.nodeType == 3 &&
    pNode.parentElement === node
  )
}

function clickable(node) {
  let tooSmall = (
    node.offsetHeight !== undefined && node.offsetHeight < MIN_SIZE ||
    node.offsetWidth !== undefined && node.offsetWidth < MIN_SIZE
  )
  if (tooSmall) return false

  const rect = getRect(node)
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
    clickableAt(node, rect.x, rect.y) ||
    clickableAt(node, rect.x + rect.width / 2, rect.y + rect.height / 2) ||
    clickableAt(node, rect.x + rect.width - 1, rect.y + rect.height - 1) ||

    clickableAt(node, rect.x + rect.width / 2, rect.y) ||
    clickableAt(node, rect.x + rect.width / 2, rect.y + rect.height - 1) ||

    clickableAt(node, rect.x, rect.y + rect.height / 2) ||
    clickableAt(node, rect.x + rect.width - 1, rect.y + rect.height / 2) ||

    clickableAt(node, rect.x + rect.width - 1, rect.y) ||
    clickableAt(node, rect.x, rect.y + rect.height - 1)
  )
}

module.exports = clickable
