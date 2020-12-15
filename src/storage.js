function setValue (name, value) {
  return GM_setValue(name, JSON.stringify(value))
}

function getValue (name) {
  try {
    return JSON.parse(GM_getValue(name))
  } catch (e) {}
}

function listValues () {
  const names = GM_listValues() || []
  return names.map(name => getValue(name))
}

const TRACK_TYPES = {
  ACTION: 'ACTION',
  RESULTS: 'RESULTS'
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
  const trackLogs = getTrackLogs()
  console.log(`m\`\n${
    trackLogs.join('\n')
  }\``)
}

function clearTrackLogs () {
  return setTrackLogs([])
}

function addTrackLog (log, index) {
  const logs = getTrackLogs()
  index = Number.isNumber(index) ? index : logs.length
  logs[index] = log
  setTrackLogs(logs)
}

function getLastTrackInfo (type) {
  const allLogs = getTrackLogs()
  const logs = allLogs.filter(([,,logType]) => logType === type)
  const lastLog = logs[logs.length - 1]
  const index = lastLog
    ? allLogs.findIndex(lastLog)
    : allLogs.length
  return [lastLog, index]
}

function updateLastTrackLog (log) {
  const [,,type] = log
  const [,index] = getLastTrackInfo(type)
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
