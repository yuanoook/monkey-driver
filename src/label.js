const { hashJoaat } = require('./hash')

function innerHTMLHash (innerHTML) {
  const unwantedAttrs = ['id', 'data', 'class', 'style', 'stroke', 'stroke-width']

  for (let attr of unwantedAttrs) {
    const attrReg = new RegExp(`${ attr }[^=]*?="[^"]*"`, 'g')
    innerHTML = innerHTML
      .replace(attrReg, '')
      .replace(/\s+/g, ' ')
      .replace(/\s+>/g, '>')
      .replace(/>\s+</g, '><')
  }

  return hashJoaat(innerHTML)
}

const labelGenerators = {
  svg: node => {
    return [`svg-${innerHTMLHash(node.innerHTML)}`]
  },
  img: node => {
    const label = /^http/.test(node.src)
      ? `img-${node.src
        .replace(/^https?:\/\/[^\/]*/, '')
        .replace(/(\?|\#).*/g,'')
        .replace(/^\s*\/*/g, '')}`
      : `img-${hashJoaat(node.src)}`

    return [label]
  }
}

function getNodeLabels (node) {
  if (node.nodeType == 3) return [node.data.trim().toLowerCase()]
  if (node.ownerSVGElement) node = node.ownerSVGElement

  const tag = node.tagName.toLowerCase()
  if (labelGenerators[tag]) return labelGenerators[tag](node)

  console.log(`No labelGenerators for `, node)
}

module.exports = {
  getNodeLabels
}
