function setValue(name, value) {
  return GM_setValue(name, JSON.stringify(value))
}

function getValue(name) {
  try {
    return JSON.parse(GM_getValue(name))
  } catch (e) {}
}

function listValues() {
  const names = GM_listValues() || []
  return names.map(name => getValue(name))
}

const storage = {
  setValue,
  getValue,
  listValues
}

module.exports = storage
