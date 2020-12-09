function clickable(node) {
  if (
    node.offsetHeight < 5 ||
    node.offsetWidth < 5
  ) {
    return false
  }

  const rect = node.getBoundingClientRect()
  const inViewPort = !(
    rect.left <= 0 ||
    rect.bottom <= 0 ||
    rect.top >= window.innerHeight ||
    rect.right >= window.innerWidth
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
