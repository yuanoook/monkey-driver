const storage = require('./storage')
const relax = require('./relax')
const {
  getKeyTextNodes
} = require('./getNodes')

const SNAPSHOT_SEPARATOR = '\0\0\0\0\0'
const getKarmaSnapshots = () => storage.getValue('karmaSnapshots') || []
const setKarmaSnapshots = (logs) => storage.setValue('karmaSnapshots', logs)
const clearKarmaSnapshots = () => setKarmaSnapshots([])

const pushKarmaSnapshot = shot => {
  const snapshots = getKarmaSnapshots()
  const [, lastShot] = snapshots[snapshots.length - 1] || [NaN, NaN]
  if (lastShot === shot) return

  snapshots[snapshots.length] = [+new Date(), shot]
  setKarmaSnapshots(snapshots)
}

function getKarma () {
  return storage.getValue('karma') || {}
}

function setKarma (causes, results) {
  if (!causes || !causes.length) return

  results = results || getKarmaResults()
  if (!results || !results.length) return

  const karma = getKarma()
  for (let result of results) {
    const rkarma = [...causes, ...(karma[result] || [])]
    karma[result] = Array.from(new Set(rkarma))
  }
  storage.setValue('karma', karma)
}

function getKarmaResults () {
  return getKeyTextNodes({
    filterMap: textNode => textNode.data.trim().toLowerCase()
  }).sort()
}

async function logKarmaResults ({getTrackLogs, relax = true}) {
  if (relax) await relax()
  pushKarmaSnapshot(
    getKarmaResults().join(SNAPSHOT_SEPARATOR)
  )
  await relax()
  pushKarmaSnapshot(
    getKarmaResults().join(SNAPSHOT_SEPARATOR)
  )
  analysisKarma({getTrackLogs})
}

// TODO: fix this shitty function, don't work when you're tired man!
function analysisKarma ({getTrackLogs}) {
  const lastAnalysisAt = (+storage.getValue('lastKarmaAnalysisAt')) || 0
  storage.setValue('lastKarmaAnalysisAt', +new Date())

  const snapshots = getKarmaSnapshots()
  const trackLogs = getTrackLogs()

  let snapIndex = allSnapshots.findIndex(([shotAt]) => shotAt >= lastAnalysisAt) - 2
  snapIndex = Math.max(snapIndex, 0)

  for (let i = snapIndex; i < snapshots.length - 1; i++) {
    const shot1 = snapshots[i]
    const shot2 = snapshots[i + 1]
    if (!shot1 || !shot2) continue

    const [shot1At,] = shot1
    const [shot2At,] = shot2
    const trackLogIndex = trackLogs.findIndexOf(([logAt]) => logAt >= shot2At) - 1

    const filteredTrackLog = trackLogs.filter(
      ([logAt]) => logAt >= shot1At && logAt < shot2At
    )
    const trackLog = filteredTrackLog[filteredTrackLog.length - 1]

  }
}

module.exports = {
  getKarma,
  setKarma,
  getKarmaResults,
  logKarmaResults,
  analysisKarma
}
