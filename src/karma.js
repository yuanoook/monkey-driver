const {
  setValue,
  getValue,
  TRACK_TYPES,
  getTrackLogs,
  addTrackLog,
  getLastTrackInfo,
  updateLastTrackLog
} = require('./storage')
const relax = require('./relax')
const {
  getKeyTextNodes
} = require('./getNodes')

const SNAPSHOT_SEPARATOR = '\0\0\0\0\0'
const getKarmaSnapshots = () => getTrackLogs(TRACK_TYPES.SNAPSHOTS)

const pushKarmaSnapshot = shotContent => {
  const snapshots = getKarmaSnapshots()
  const [[, lastContent]] = getLastTrackInfo(TRACK_TYPES.SNAPSHOTS)
  if (lastContent === shotContent) return

  addTrackLog([+new Date(), shotContent, TRACK_TYPES.SNAPSHOTS])
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

const karmaAnalysts = {
  [TRACK_TYPES.ACTION]: (log, prevAction) => {
    // TODO: add some cool stuff here
  },
  [TRACK_TYPES.SNAPSHOTS]: (log, prevAction) => {
    // TODO: add some cool stuff here
  }
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
  analysisKarma()
}

function getPrevActionLog ({
  log,
  prevLog,
  prevLogIndex,
  lastAnalysisIndex
}) {
  const [logAt] = log
  if (!prevLog) {
    [prevLog, prevLogIndex] = getLastTrackInfo(TRACK_TYPES.ACTION, lastAnalysisIndex)
  }
  if (!prevLog) return

  const [preLogAt, prevLogContent, prevLogType] = prevLog

  if (prevLogType !== TRACK_TYPES.ACTION) return
  if (logAt - preLogAt > 150 * 1000) return // 2.5 Minutes, too old

  return prevLog
}

function analysisKarma () {
  const [, lastAnalysisIndex, , allLogs] = getLastTrackInfo(TRACK_TYPES.ANALYSIS)
  const logs = allLogs.slice(lastAnalysisIndex + 1)
  if (!logs.length) return

  let hit = false
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i]
    const [logAt, , type] = log
    if (!karmaAnalysts[type]) continue

    const prevAction = getPrevActionLog({
      log,
      prevLog: logs[i - 1],
      prevLogIndex: i - 1,
      lastAnalysisIndex
    })
    if (!prevAction) continue

    hit = hit || karmaAnalysts[type](log, prevAction)
  }

  if (hit) addTrackLog([+new Date(), , TRACK_TYPES.ANALYSIS])
  return hit
}

module.exports = {
  getKarma,
  setKarma,
  getKarmaResults,
  logKarmaResults,
  analysisKarma
}
