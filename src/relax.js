const { getKeyTextNodes } = require('./getNodes')

const nap = ms => new Promise(r => setTimeout(r, ms))

const loadingTests = [
  node => /^loading[\.\s]*$/i.test(node.innerText.trim())
]

function isLoading () {
  const nodes = getKeyTextNodes()
  const loadings = nodes.filter(
    node => loadingTests.some(t => t(node))
  )
  return loadings.length >= nodes.length / 2
}

async function waitLoading () {
  await nap(100)
  return isLoading() ? waitLoading() : null
}

async function relax (ms) {
  await waitLoading()
  await nap(100)
}

module.exports = relax
