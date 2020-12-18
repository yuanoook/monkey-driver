function setValue (name, value) {
  value = JSON.stringify(value)
  // return GM_setValue(name, value)
  return localStorage.setItem(`monkey_driver-${name}`, value)
}

function getValue (name) {
  try {
    // return JSON.parse(GM_getValue(name))
    return JSON.parse(localStorage.getItem(`monkey_driver-${name}`))
  } catch (e) {}
}

function listValues () {
  const names = GM_listValues() || []
  return names.map(name => getValue(name))
}

const TRACK_TYPES = {
  ACTION: 1,
  SNAPSHOTS: 2,
  ANALYSIS: 3
}

function getTrackLogs (type) {
  const logs = storage.getValue('trackLogs') || []
  if (!type) return logs
  return logs.filter(([,,logType]) => logType === type)
}

function setTrackLogs (logs) {
  return storage.setValue('trackLogs', logs)
}

function printTrackLogs (type) {
  const trackLogs = getTrackLogs(type)
  console.log(`monkeyDrive\`\n${
    trackLogs.map(([,logContent]) => logContent).join('\n')
  }\``)
}

function clearTrackLogs () {
  return setTrackLogs([])
}

function addTrackLog (log, index = NaN) {
  const logs = getTrackLogs()
  index = Number.isNaN(index) ? logs.length : index
  logs[index] = log
  setTrackLogs(logs)
}

function getLastTrackInfo (type, maxIndex = Infinity) {
  const allLogs = getTrackLogs()
  const logs = allLogs.filter(
    ([,,logType], index) => logType === type && index < maxIndex
  )
  const lastLog = logs[logs.length - 1]
  const index = lastLog
    ? allLogs.indexOf(lastLog)
    : allLogs.length
  return {lastLog, index, logs, allLogs}
}

function updateLastTrackLog (log) {
  const [,,type] = log
  const {index} = getLastTrackInfo(type)
  addTrackLog(log, index)
}

const storage = {
  setValue,
  getValue,
  listValues,
  TRACK_TYPES,
  getTrackLogs,
  setTrackLogs,
  printTrackLogs,
  clearTrackLogs,
  addTrackLog,
  getLastTrackInfo,
  updateLastTrackLog
}

module.exports = storage
