const clickable = require('./clickable')
const {
  fromPoint,
  textNodeFromPoint,
  getRect,
  getTextBoundingClientRect
} = require('./point')

function getKeyNodes({ selector, filter, prioritize } = {}) {
  let nodes = Array.from(document.querySelectorAll(selector || '*'))
  nodes = nodes.filter(
    node => clickable(node) && (!filter || filter({node}))
  )
  return prioritize ? prioritize(nodes) : nodes
}

function getKeyTextNodes({
  selector,
  filter,
  prioritize,
  container = document.body
} = {}) {
  const iterator = document.createNodeIterator(container, NodeFilter.SHOW_TEXT)
  const keyNodes = new Set()
  const selected = selector && Array.from(document.querySelectorAll(selector) || [])
  let textNode
  while (textNode = iterator.nextNode()) {
    if (!textNode.data.trim()) continue
    if (!clickable(textNode)) continue

    let node = textNode.parentElement
    if (!clickable(node)) continue
    if (selector && !selected.includes(node)) continue
    if (filter && !filter({node, textNode})) continue

    keyNodes.add(node)
  }
  const nodes = Array.from(keyNodes)
  return prioritize ? prioritize(nodes) : nodes
}

function getKeyImages() {
  return getKeyNodes({ selector: 'img, svg' })
}

function getKeyButtonsAndLinks(text) {
  text = text.toLowerCase()
  return getKeyTextNodes({
    selector: 'button, button *, a, a *, li, li *',
    filter: text && (({node, textNode}) =>
      textNode.data.trim().toLowerCase() === text ||
      node.innerText.trim().toLowerCase() === text
    )
  })
}

function identifiersMatch(identifiers, text) {
  text = (text || '').trim().toLowerCase()
  return identifiers.includes(text) ||
    identifiers.includes(text.replace(/[:：]\s*$/, '')) 
}

function inputNamePlaceholderMatch({node, identifiers}) {
  // TODO, mark monkey-driver-identifier for further use
  if (identifiersMatch(identifiers, node.name)) return true
  if (identifiersMatch(identifiers, node.placeholder)) return true
}

function inputLabelsMatch({labels, identifiers}) {
  return labels.some(label => getKeyTextNodes({
    container: label,
    filter: ({node, textNode}) => {
      // TODO, mark monkey-driver-identifier for further use
      if (identifiersMatch(identifiers, textNode.data)) return true
      if (identifiersMatch(identifiers, node.innerText)) return true
    }
  }).length)
}

function inputDirectLabelMatch({node, identifiers}) {
  const labels = Array.from(node.labels)
  return inputLabelsMatch({labels, identifiers})
}

function getGuessLabels(node) {
  const rect = node.getBoundingClientRect()
  const height = Math.max(Math.min(node.offsetHeight, 80), 40)
  return [
    fromPoint(rect.x + height/2, rect.y - height/2),
    fromPoint(rect.x - 2 * height, rect.y + height/2)
  ].filter(node => node && (node.nodeType == 3 || (
    node.offsetHeight < height * 1.5 &&
    node.offsetWidth < node.offsetWidth * 1.5
  )))
}

function inputPositionLabelMatch({node, identifiers}) {
  const guessLabels = getGuessLabels(node)
  return guessLabels.some(label => label.nodeType == 3
    ? identifiersMatch(identifiers, label.data)
    : inputLabelsMatch({labels: [label], identifiers})
  )
}

function getKeyInputs({command, label}) {
  command = command.toLowerCase()
  label = label.toLowerCase()
  const identifiers = [command, label]
  const directInputs = getKeyNodes({
    selector: 'input, textarea',
    filter: ({node}) => {
      if (inputNamePlaceholderMatch({node, identifiers})) return true
      if (inputDirectLabelMatch({node, identifiers})) return true
      if (inputPositionLabelMatch({node, identifiers})) return true
    }
  })
  return directInputs
}

function getNodeText(node) {
  if (node.nodeType == 3) {
    return node.data.trim()
  }

  const texts = []
  getKeyTextNodes({
    container: node,
    filter: ({textNode}) => {
      texts.push(textNode.data.trim())
      return true
    }
  })
  return texts[0]
}

function getRealLabelText(input) {
  if (!input.labels) return

  const labels = Array.from(input.labels)
  for (let label of labels) {
    const text = getNodeText(label)
    if (text) return text
  }
}

function getGuessLabelText(input) {
  const labels = getGuessLabels(node)
  for (let label of labels) {
    const text = getNodeText(label)
    if (text) return text
  }
}

function getInputLabel(input) { 
  return input.name ||
    input.placeholder ||
    getRealLabelText(input) ||
    getGuessLabelText(input) ||
    ''
}

module.exports = {
  getKeyNodes,
  getKeyTextNodes,
  getKeyInputs,
  getInputLabel,
  getKeyImages,
  getKeyButtonsAndLinks
}
