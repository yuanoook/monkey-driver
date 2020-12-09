function fromPoint(x, y) {
  return textNodeFromPoint(x, y) || document.elementFromPoint(x, y)
}

function textNodeFromPoint(x, y) {
  const range = (document.caretRangeFromPoint || document.caretPositionFromPoint)
    .call(document, x, y)
  if (!range) return null
  const node = range.startContainer || range.offsetNode
  return node.nodeType == 3 ? node : null
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