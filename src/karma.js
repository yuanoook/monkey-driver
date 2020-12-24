const {
  TRACK_TYPES,
  addTrackLog,
  getLastTrackInfo
} = require('./storage')
const relax = require('./relax')
const {
  getPageLabels
} = require('./getNodes')

const INPUT_ACTION_REG = /[:]\s(.+)/
const SNAPSHOT_SEPARATOR = '\0\0\0\0\0'

const pushKarmaSnapshot = content => {
  const {lastLog: lastShot} = getLastTrackInfo(TRACK_TYPES.SNAPSHOTS)
  const {content: lastContent} = lastShot || {}
  if (lastContent === content) return

  addTrackLog({content, type: TRACK_TYPES.SNAPSHOTS})
}

function getKarma () {
  return storage.getValue('karma') || {}
}

function clearKarma () {
  return storage.setValue('karma', {}, true)
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
  [TRACK_TYPES.ACTION]: ({content}, {content: prevContent}) => {
    const [key] = content.split(INPUT_ACTION_REG)
    const [prevKey] = prevContent.split(INPUT_ACTION_REG)

    setKarma([prevKey, prevContent], [key, content])
  },
  [TRACK_TYPES.SNAPSHOTS]: ({content}, {content: prevContent}) => {
    const results = content.split(SNAPSHOT_SEPARATOR)
    const [prevKey] = prevContent.split(INPUT_ACTION_REG)

    setKarma([prevKey, prevContent], results)
  }
}

function getKarmaResults () {
  return getPageLabels()
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
  lastAnalysisIndex
}) {
  const {logAt} = log
  if (!prevLog) {
    const lastAction = getLastTrackInfo(TRACK_TYPES.ACTION, lastAnalysisIndex)
    prevLog = lastAction.lastLog
    prevLogIndex = lastAction.index
  }
  if (!prevLog) return

  const {logAt: preLogAt, content: prevLogContent, type: prevLogType} = prevLog

  if (prevLogType !== TRACK_TYPES.ACTION) return
  if (logAt - preLogAt > 150 * 1000) return // 2.5 Minutes, too old

  return prevLog
}

function analysisKarma () {
  let {index: lastAnalysisIndex, allLogs} = getLastTrackInfo(TRACK_TYPES.ANALYSIS)
  lastAnalysisIndex = lastAnalysisIndex === allLogs.length ? -1 : lastAnalysisIndex

  const logs = allLogs.slice(lastAnalysisIndex + 1)
  if (!logs.length) return

  let hit = false
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i]
    const {type} = log
    if (!karmaAnalysts[type]) continue

    const prevAction = getPrevActionLog({
      log,
      prevLog: logs[i - 1],
      lastAnalysisIndex
    })
    if (!prevAction) continue

    hit = hit || karmaAnalysts[type](log, prevAction)
  }

  if (hit) addTrackLog({type: TRACK_TYPES.ANALYSIS})
  return hit
}

const karma = {
  getKarma,
  clearKarma,
  setKarma,
  getKarmaResults,
  logKarmaResults,
  analysisKarma
}

module.exports = karma
