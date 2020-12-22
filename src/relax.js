const {
  TRACK_TYPES,
  getTrackLogs
} = require('./storage')
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

function isPageUnloaded () {
  const logs = getTrackLogs()
  for (let i = logs.length; i > 0; i --) {
    const {type} = logs[i - 1]
    if (type === TRACK_TYPES.LOAD) return false
    if (type === TRACK_TYPES.UNLOAD) return true
  }
}

async function waitLoading () {
  await nap(100)
  return isLoading() ? waitLoading() : null
}

async function relax (ms = 100) {
  if (isPageUnloaded()) await nap(10 * 60 * 1000)

  await waitLoading()
  await nap(ms)
}

module.exports = relax
