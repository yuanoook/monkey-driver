const storageKeyPrefix = `monkey_driver-${monkeyDriverVersion}-`

function cleanLagacyStorage () {
  Object.keys(localStorage).forEach(key => {
    if (
      /monkey.?driver/i.test(key) &&
      key.indexOf(storageKeyPrefix) !== 0
    ) {
      localStorage.removeItem(key)
    }
  })
}

cleanLagacyStorage()

let memoryStorage = null

function retrieveStorage () {
  try {
    memoryStorage = JSON.parse(localStorage.getItem(storageKeyPrefix) || '{}')
  } catch (e) {}
}

function persistStorage () {
  localStorage.setItem(storageKeyPrefix, JSON.stringify(memoryStorage))
}

function setValue (name, value, persist = false) {
  if (!memoryStorage) retrieveStorage()
  memoryStorage[name] = value
  if (persist) persistStorage()
}

function getValue (name) {
  if (!memoryStorage) retrieveStorage()
  return memoryStorage[name]
}

function listValues () {
  const names = GM_listValues() || []
  return names.map(name => getValue(name))
}

const TRACK_TYPES = {
  ACTION: 'ACTION',
  SNAPSHOTS: 'SNAPSHOTS',
  ANALYSIS: 'ANALYSIS',
  LOAD: 'LOAD',
  UNLOAD: 'UNLOAD'
}

function getTrackLogs (type) {
  const logs = storage.getValue('trackLogs') || []
  if (!type) return logs
  return logs.filter(({type: logType}) => logType === type)
}

function setTrackLogs (logs, persist = false) {
  return storage.setValue('trackLogs', logs, persist)
}

function printTrackLogs (type) {
  const trackLogs = getTrackLogs(type)
  console.log(`monkeyDrive\`\n${
    trackLogs.map(({content}) => content).join('\n')
  }\``)
}

function clearTrackLogs (persist = true) {
  return setTrackLogs([], persist)
}

function addTrackLog (log, index = NaN) {
  log = {logAt: getHighResTime(), ...log}
  const logs = getTrackLogs()
  index = Number.isNaN(index) ? logs.length : index
  logs[index] = log
  setTrackLogs(logs, log.type === TRACK_TYPES.UNLOAD)
  console.log(log)
}

function getLastTrackInfo (type, maxIndex = Infinity) {
  const allLogs = getTrackLogs()
  const logs = allLogs.filter(
    ({type: logType}, index) => logType === type && index < maxIndex
  )
  const lastLog = logs[logs.length - 1]
  const index = lastLog
    ? allLogs.indexOf(lastLog)
    : allLogs.length
  return {lastLog, index, logs, allLogs}
}

function updateLastTrackLog (log) {
  const {index} = getLastTrackInfo(log.type)
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
