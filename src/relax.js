const relax = require('./relax')
const { getKeyElementsWithText } = require('./getNodes')

const nap = ms => new Promise(r => setTimeout(r, ms))

const loadingTests = [
  node => /^loading[\.\s]*$/i.test(node.innerText.trim())
]

function isLoading () {
  const nodes = getKeyElementsWithText()
  const loadings = nodes.filter(
    node => loadingTests.some(t => t(node))
  )
  return loadings.length >= nodes.length / 2
}

async function waitLoading () {
  await nap(100)
  return isLoading() ? waitLoading() : null
}

async function relax (ms = 100) {
  await waitLoading()
  await nap(ms)
}

module.exports = relax
