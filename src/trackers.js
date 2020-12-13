const storage = require('./storage')
const { getInputLabel } = require('./getNodes')
const {
  isDashboardOpen,
  toggleDashboard,
  closeDashboard,
  refreshDashboard
} = require('./dashboard')
const {
  logKarmaResults
} = require('./karma')

const getTrackLogs = () => storage.getValue('trackLogs') || []
const setTrackLogs = (logs) => storage.setValue('trackLogs', logs)
const clearTrackLogs = () => setTrackLogs([])

const pushLog = (log, separator) => {
  logKarmaResults({getTrackLogs, relax: false})

  const trackLogs = getTrackLogs()
  const [key] = separator ? log.split(separator) : [log]
  const [, lastLog] = trackLogs[trackLogs.length - 1] || [NaN, NaN]
  const [lastKey] = (lastLog && separator) ? lastLog.split(separator) : [lastLog]
  trackLogs[trackLogs.length + (key === lastKey ? -1 : 0)] = [+new Date(), log]
  setTrackLogs(trackLogs)
}

const printLog = () => {
  const trackLogs = getTrackLogs()
  console.log(`m\`\n${
    trackLogs.join('\n')
  }\``)
}

const clickTraker = e => {
  if (isDashboardOpen()) return
  if (e.eventPhase === Event.BUBBLING_PHASE) return logKarmaResults({getTrackLogs})

  const node = fromPoint(e.clientX, e.clientY)
  if (node.nodeType == 3) {
    pushLog(node.data.trim())
    printLog()
  } else {
    console.log(node)
  }
}

const inputTraker = e => {
  if (isDashboardOpen()) return
  if (e.eventPhase === Event.BUBBLING_PHASE) return logKarmaResults({getTrackLogs})

  const input = e.target
  const label = getInputLabel(input)
  pushLog(`${
    label.replace(/\s*[:：]\s*$/, '').trim()
  }: ${
    (input.value || '').trim()
  }`, /[:](.+)/)
  printLog()
}

const shortCuts = {
  "0": () => (clearTrackLogs(), refreshDashboard({getTrackLogs})),
  "1": () => toggleDashboard({getTrackLogs}),
  "Escape": closeDashboard
}

const keydownTracker = e => {
  if (e.target && /input|textarea/i.test(e.target.tagName)) return
  if (e.ctrlKey || e.metaKey || e.shiftKey) return
  if (!shortCuts[e.key]) return
  if (e.eventPhase === Event.BUBBLING_PHASE) return

  shortCuts[e.key]()
}

const trackers = {
  clearTrackLogs,
  getTrackLogs,
  printLog,
  click: clickTraker,
  input: inputTraker,
  keydown: keydownTracker
}

module.exports = trackers