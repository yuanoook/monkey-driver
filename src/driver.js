const storage = require('./storage')
const {
  getKarma,
  setKarma
} = require('karma')
const clickable = require('./clickable')
const {
  getKeyElements,
  getKeyTextNodes,
  getKeyElementsWithText,
  getKeyInputs,
  getInputLabel,
  getKeyImages,
  getKeyButtonsAndLinks
} = require('./getNodes')
const {
  fromPoint,
  textNodeFromPoint,
  getRect,
  getTextBoundingClientRect
} = require('./point')
const handlers = require('./handlers')
const relax = require('./relax')
const trackers = require('./trackers')
const { formatDateTime } = require('./date')

const handleCommand = ({ handler, content }) => {
  const node = getKeyElementsWithText({
    selector: handler.selector,
    filter: handler.filter && (node => handler.filter({node, content})),
    prioritize: handler.prioritize && (nodes => handler.prioritize(nodes, content))
  })[0]
  return node ? handler.run(node, content) : null
}

const guessClick = command => {
  // if there's a button/link/li with text which is exactly the command, click it
  const button = getKeyButtonsAndLinks(command)[0]
  if (!button) return false
  button.click()
  return true
}

const guessInput = async command => {
  // if there's a label near an input/textarea, focus it
  let [label, content = ''] = command.split(/[:：](.+)/)
  label = label.trim()
  content = content.trim()
  const input = getKeyInputs({command, label})[0]
  if (!input) return false
  input.click()
  await relax(100)
  if (content) {
    input.value = content
    input.dispatchEvent(new Event('input'))
    await relax(100)
    input.dispatchEvent(new Event('change'))
  }
  return true
}

const operateManual = command => {
  for (let key in handlers) {
    const reg = new RegExp(`^${key}( |$)`, 'i')
    if (!reg.test(command)) continue

    return handleCommand({
      handler: handlers[key],
      content: command.replace(reg, '')
    })
  }
}

const execute = async command => {
  // Monkey Driver Rule No.1 - Click
  if (await guessClick(command)) return

  // Monkey Driver Rule No.2 - Input
  if (await guessInput(command)) return

  // Monkey Driver Rule No.3 - Manual
  if (await operateManual(command)) return

  // Monkey Driver is confused
  console.log(`Monkey has no idea what to do with ${command}`)
}

const drive = async scripts => {
  const commands = scripts
    .join('\n')
    .split(/\n/)
    .map(c => c.trim())
    .filter(c => c)

  for (let command of commands) {
    await relax(100)
    await execute(command)
  }
}

window.monkeyDrive = drive
window.m = window.monkeyDrive

Object.keys(trackers).forEach(key => {
  document.addEventListener(key, e => e.isTrusted && trackers[key](e), true)
  document.addEventListener(key, e => e.isTrusted && trackers[key](e), false)
})

console.log('Monkey Driver is driving :)')

Object.assign(drive, {
  storage,
  clickable,
  getKeyElements,
  getKeyTextNodes,
  getKeyElementsWithText,
  getKeyInputs,
  getInputLabel,
  getKeyImages,
  getKeyButtonsAndLinks,
  fromPoint,
  textNodeFromPoint,
  getRect,
  getTextBoundingClientRect,
  relax,
  trackers,
  getKarma,
  setKarma,
  formatDateTime
})

module.exports = {
  drive
}