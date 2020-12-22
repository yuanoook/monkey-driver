const { hashJoaat } = require('./hash')

function innerHTMLHash (innerHTML) {
  return hashJoaat(innerHTML.replace(/\s?data[^=]*?((="[^"]*")|\s)/g, ''))
}

const labelGenerators = {
  svg: node => {
    return [`svg-${innerHTMLHash(node.innerHTML)}`]
  },
  img: node => {
    const label = /^http/.test(node.src)
      ? node.src.replace(location.origin, '')
      : `img-${hashJoaat(node.src)}`

    return [label]
  }
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
