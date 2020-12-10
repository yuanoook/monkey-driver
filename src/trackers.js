const trackLogs = []

const printLog = () => {
  console.log(`m\`
    ${trackLogs.join('\n')}
  \``)
}

const clickTraker = e => {
  const node = fromPoint(e.clientX, e.clientY)
  console.log(node)
  if (node.nodeType == 3) {
    logScript += ('\n' + node.data.trim().toLowerCase())
    console.log(logScript + '\n`')
  }
}

const inputTraker = e => {
  const input = e.target
}

const trackers = {
  click: clickTraker,
  input: inputTraker
}

module.exports = trackers