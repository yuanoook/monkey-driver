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

const INPUT_ACTION_REG = /[:]\s(.+)/
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
  causes = Array.from(new Set(causes))
  if (!causes || !causes.length) return

  results = results || getKarmaResults()
  if (!results || !results.length) return

  const karma = getKarma()
  for (let result of results) {
    for (let cause of causes) {
      karma[result] = karma[result] || {}
      karma[result][cause] = (karma[result][cause] | 0) + 1
    }
  }
  storage.setValue('karma', karma)
}

const karmaAnalysts = {
  [TRACK_TYPES.ACTION]: (log, prevAction) => {
    const [[content], [prevContent]] = [log, prevAction]
    const [key] = content.split(INPUT_ACTION_REG)
    const [prevKey] = prevContent.split(INPUT_ACTION_REG)

    setKarma([prevKey, prevContent], [key, content])
  },
  [TRACK_TYPES.SNAPSHOTS]: (log, prevAction) => {
    const [[content], [prevContent]] = [log, prevAction]
    const results = content.split(SNAPSHOT_SEPARATOR)
    const [prevKey] = prevContent.split(INPUT_ACTION_REG)

    setKarma([prevKey, prevContent], results)
  }
}

function getKarmaResults () {
  return getKeyTextNodes({
    filterMap: textNode => textNode.data.trim().toLowerCase()
  }).sort()
}

async function logKarmaResults (immediate = false) {
  if (!immediate) await relax()
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

const karma = {
  getKarma,
  setKarma,
  getKarmaResults,
  logKarmaResults,
  analysisKarma
}

module.exports = karma
