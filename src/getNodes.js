const clickable = require('./clickable')
const { fromPoint } = require('./point')
const { getNodeLabels } = require('./label')

function getKeyElements({ selector, filter, prioritize } = {}) {
  let nodes = Array.from(document.querySelectorAll(selector || '*'))
  nodes = nodes.filter(
    node => clickable(node) && (!filter || filter({node}))
  )
  return prioritize ? prioritize(nodes) : nodes
}

function getClickableTextNodes({
  filterMap,
  container = document.body
}) {
  const iterator = document.createNodeIterator(container, NodeFilter.SHOW_TEXT)
  const results = new Set()
  let textNode
  while (textNode = iterator.nextNode()) {
    if (!textNode.data.trim()) continue
    if (!clickable(textNode)) continue
  
    if (filterMap) {
      const fmResult = filterMap(textNode)
      if (!fmResult) continue

      results.add(fmResult)
      continue
    }

    results.add(textNode)
  }
  return Array.from(results)
}

function getPageImageLabels () {
  const images = getKeyImages()
  return images.map(getNodeLabels).flat()
}

function getInputLabels () {
  const inputs = getKeyElements({selector: 'input'})
  return inputs.map(input => {
    const label = getInputLabel(input)
    return [label, `${label}: ${(input.value || ''.trim())}`]
  }).flat()
}

function getPageTextLabels () {
  return getClickableTextNodes({
    filterMap: textNode => textNode.data.trim().toLowerCase()
  })
}

function getPageLabels () {
  return Array.from(new Set([
    ...getPageTextLabels(),
    ...getInputLabels(),
    ...getPageImageLabels()
  ])).sort()
}

function getKeyElementsWithText({
  selector,
  filter,
  prioritize,
  container = document.body
} = {}) {
  const selected = selector && Array.from(document.querySelectorAll(selector) || [])

  const elements = getClickableTextNodes({
    container,
    filterMap: textNode => {
      let element = textNode.parentElement
      if (!clickable(element)) return
      if (selector && !selected.includes(element)) return
      if (filter && !filter({node: element, textNode})) return

      return element
    }
  })

  return prioritize ? prioritize(elements) : elements
}

function getKeyImages(label) {
  const nodes = getKeyElements({ selector: 'img, svg' })
  return label
    ? nodes.filter(node => getNodeLabels(node).includes(label))
    : nodes
}

function getKeyButtonsAndLinks(text = '') {
  text = text.toLowerCase()
  return getKeyElementsWithText({
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
    identifiers.includes(text.replace(/\s*[:：]\s*$/, '')) 
}

function inputNamePlaceholderMatch({node, identifiers}) {
  if (identifiersMatch(identifiers, node.name)) return true
  if (identifiersMatch(identifiers, node.placeholder)) return true
}

function inputLabelsMatch({labels, identifiers}) {
  return labels.some(label => getKeyElementsWithText({
    container: label,
    filter: ({node, textNode}) => {
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
  const directInputs = getKeyElements({
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
  getKeyElementsWithText({
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
  const labels = getGuessLabels(input)
  for (let label of labels) {
    const text = getNodeText(label)
    if (text) return text
  }
}

function getInputLabel(input) { 
  return (
    input.name ||
    input.placeholder ||
    getRealLabelText(input) ||
    getGuessLabelText(input) ||
    ''
  ).toLowerCase().trim()
}

module.exports = {
  getKeyElements,
  getClickableTextNodes,
  getKeyElementsWithText,
  getKeyInputs,
  getInputLabel,
  getKeyImages,
  getKeyButtonsAndLinks,
  getPageLabels,
}
