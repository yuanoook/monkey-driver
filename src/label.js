const { hashJoaat } = require('./hash')

const labelGenerators = {
  svg: node => [`svg-${hashJoaat(node.innerHTML)}`]
}

function getNodeLabels (node) {
  if (node.nodeType == 3) return [node.data.trim().toLowerCase()]

  const tag = node.tagName.toLowerCase()
  if (labelGenerators[tag]) return labelGenerators[tag](node)

  console.log(`No labelGenerators for `, node)
}

module.exports = {
  getNodeLabels
}
