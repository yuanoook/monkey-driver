function fromPoint(x, y) {
  return textNodeFromPoint(x, y) || document.elementFromPoint(x, y)
}

function textNodeFromPoint(x, y) {
  const range = (document.caretRangeFromPoint || document.caretPositionFromPoint)
    .call(document, x, y)
  if (!range) return null

  const node = range.startContainer || range.offsetNode
  if (!(node.nodeType == 3)) return null

  const rect = getRect(node)
  const underClick = x >= rect.left &&
    x <= rect.right &&
    y >= rect.top &&
    y <= rect.bottom

  return underClick ? node : null
}

function getRect(node) {
  return node.nodeType == 3
    ? getTextBoundingClientRect(node)
    : node.getBoundingClientRect()
}

function getTextBoundingClientRect(text) {
  const range = document.createRange()
  range.selectNode(text)
  const rect = range.getBoundingClientRect()
  range.detach()
  return rect
}

module.exports = {
  fromPoint,
  textNodeFromPoint,
  getRect,
  getTextBoundingClientRect
}