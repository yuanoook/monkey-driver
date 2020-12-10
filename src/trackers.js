const { getInputLabel } = require('./getNodes')

const trackLogs = []

const printLog = () => {
  console.log(`m\`
    ${trackLogs.join('\n')}
  \``)
}

const clickTraker = e => {
  const node = fromPoint(e.clientX, e.clientY)
  if (node.nodeType == 3) {
    trackLogs.push(node.data.trim())
    printLog()
  } else {
    console.log(node)
  }
}

const inputTraker = e => {
  const input = e.target
  const label = getInputLabel(input)
  trackLogs.push(`${label}: ${input.value}`)
  printLog()
}

const trackers = {
  click: clickTraker,
  input: inputTraker
}

module.exports = trackers