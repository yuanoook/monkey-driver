const storage = require('./storage')
const karma = require('karma')
const clickable = require('./clickable')
const {
  getKeyElements,
  getClickableTextNodes,
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

const guessImagesClick = command => {
  const image = getKeyImages(command)[0]
  if (!image) return false
  image.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}))
  return true
}

const guessButtonsLinksClick = command => {
  const button = getKeyButtonsAndLinks(command)[0]
  if (!button || button.disabled) return false
  button.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}))
  return true
}

const guessClick = command => {
  return guessButtonsLinksClick(command) || guessImagesClick(command)
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
    input.dispatchEvent(new Event('input', {bubbles: true, cancelable: true}))
    await relax(100)
    input.dispatchEvent(new Event('change', {bubbles: true, cancelable: true}))
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

// TODO, fix this logic :D
// TODO, set a cross-session task manage process
const operateKarma = async (command, history) => {
  history = history || []
  history.push(command)

  const karmaNetwork = karma.getKarma()
  const karmaNode = karmaNetwork[command]
  const causes = Object.keys(karmaNode || {})
    .filter(cause => !history.includes(cause))
    .sort((a, b) => karmaNode[b] - karmaNode[a])

  if (!causes.length) return false

  for (let cause of causes) {
    if (await execute(cause, history)) {
      if (await execute(command, history)) {
        return true
      }
    }
  }
}

const execute = async (command, history) => {
  await relax(100)

  // Monkey Driver Rule No.1 - Click
  if (await guessClick(command)) return true

  // Monkey Driver Rule No.2 - Input
  if (await guessInput(command)) return true

  // Monkey Driver Rule No.3 - Manual
  if (await operateManual(command)) return true

  // Monkey Driver Rule No.4 - Karma
  if (await operateKarma(command, history)) return true

  // Monkey Driver is confused
  console.log(`Monkey has no idea what to do with ${command}`)
}

const drive = async scripts => {
  scripts = Array.isArray(scripts) ? scripts : [scripts]

  const commands = scripts
    .join('\n')
    .split(/\n/)
    .map(c => c.trim())
    .filter(c => c)

  for (let command of commands) await execute(command)
}

window.monkeyDrive = drive

Object.keys(trackers).forEach(key => {
  const listener = trackers[key]
  if (listener.options) {
    window.addEventListener(key, e => e.isTrusted && listener(e), listener.options)
  } else {
    window.addEventListener(key, e => e.isTrusted && listener(e), true)
    window.addEventListener(key, e => e.isTrusted && listener(e), false)
  }
})

console.log('Monkey Driver is driving :)')

Object.assign(drive, {
  storage,
  karma,
  clickable,
  getKeyElements,
  getClickableTextNodes,
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
  formatDateTime
})

module.exports = {
  drive
}