const {
  TRACK_TYPES,
  getTrackLogs,
  printTrackLogs,
  clearTrackLogs,
  clearKarma,
  addTrackLog,
  getLastTrackInfo
} = require('./storage')
const { getInputLabel } = require('./getNodes')
const {
  isDashboardOpen,
  toggleDashboard,
  closeDashboard,
  refreshDashboard
} = require('./dashboard')
const { logKarmaResults } = require('./karma')
const { getHighResTime } = require('./date')

const pushActionLog = (content, separator) => {
  logKarmaResults(true)

  const [key] = separator ? content.split(separator) : [content]
  const {
    lastLog: {content: lastLog} = {},
    index: lastIndex
  } = getLastTrackInfo(TRACK_TYPES.ACTION)

  const [lastKey] = (lastLog && separator) ? lastLog.split(separator) : [lastLog]
  const newLog = {content, type: TRACK_TYPES.ACTION}

  addTrackLog(newLog, key === lastKey ? lastIndex : undefined)
  printTrackLogs(TRACK_TYPES.ACTION)
}

const clickTracker = e => {
  if (isDashboardOpen()) return
  if (e.eventPhase === Event.BUBBLING_PHASE) return logKarmaResults()

  const node = fromPoint(e.clientX, e.clientY)
  if (node.nodeType == 3) {
    pushActionLog(node.data.trim())
  } else {
    console.log(node)
  }
}

const inputTracker = e => {
  if (isDashboardOpen()) return
  if (e.eventPhase === Event.BUBBLING_PHASE) return logKarmaResults()

  const input = e.target
  const label = getInputLabel(input)
  pushActionLog(`${
    label.replace(/\s*[:：]\s*$/, '').trim()
  }: ${
    (input.value || '').trim()
  }`, /[:]\s(.+)/)
}

const shortCuts = {
  "0": () => (clearTrackLogs(), clearKarma(), refreshDashboard()),
  "1": toggleDashboard,
  "Escape": closeDashboard
}

const keydownTracker = e => {
  if (e.target && /input|textarea/i.test(e.target.tagName)) return
  if (e.ctrlKey || e.metaKey || e.shiftKey) return
  if (!shortCuts[e.key]) return
  if (e.eventPhase === Event.BUBBLING_PHASE) return

  shortCuts[e.key]()
}

addTrackLog({content: location.href, type: TRACK_TYPES.LOAD})
const beforeunloadTracker = () => {
  addTrackLog({content: location.href, target: document.activeElement.href, type: TRACK_TYPES.UNLOAD})
}
beforeunloadTracker.options = {once: true}

const trackers = {
  clearTrackLogs,
  getTrackLogs,
  beforeunload: beforeunloadTracker,
  click: clickTracker,
  input: inputTracker,
  keydown: keydownTracker
}

module.exports = trackers