const storage = require('./storage')
const { getInputLabel } = require('./getNodes')
const { toggleDashboard } = require('./dashboard')
const getLogs = () => storage.getValue('trackLogs') || []
const setLogs = (logs) => storage.setValue('trackLogs', logs)

const pushLog = (log, separator) => {
  const trackLogs = getLogs()
  const [key] = separator ? log.split(separator) : [log]
  const lastLog = trackLogs[trackLogs.length - 1]
  const [lastKey] = (lastLog && separator) ? lastLog.split(separator) : [lastLog]
  trackLogs[trackLogs.length + (key === lastKey ? -1 : 0)] = log
  setLogs(trackLogs)
}

const printLog = () => {
  const trackLogs = getLogs()
  console.log(`m\`\n${
    trackLogs.join('\n')
  }\``)
}

const clickTraker = e => {
  const node = fromPoint(e.clientX, e.clientY)
  if (node.nodeType == 3) {
    pushLog(node.data.trim())
    printLog()
  } else {
    console.log(node)
  }
}

const inputTraker = e => {
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
  "1": () => toggleDashboard({ getLogs })
}

const keydownTracker = e => {
  if (e.target && /input|textarea/i.test(e.target.tagName)) return
  if (e.ctrlKey || e.metaKey || e.shiftKey) return

  shortCuts[e.key]()
}

const trackers = {
  getLogs,
  click: clickTraker,
  input: inputTraker,
  keydown: keydownTracker
}

module.exports = trackers