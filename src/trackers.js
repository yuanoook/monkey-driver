const { getInputLabel } = require('./getNodes')

const trackLogs = []

const pushLog = (log, separator) => {
  const [key] = separator ? log.split(separator) : [log]
  const lastLog = trackLogs[trackLogs.length - 1]
  const [lastKey] = (lastLog && separator) ? lastLog.split(separator) : [lastLog]
  trackLogs[trackLogs.length + (key === lastKey ? -1 : 0)] = log
}

const printLog = () => {
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

const trackers = {
  click: clickTraker,
  input: inputTraker
}

module.exports = trackers