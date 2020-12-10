const clickable = require('./clickable')
const {
  getKeyNodes,
  getKeyTextNodes,
  getKeyInputs,
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

const handleCommand = ({ handler, content }) => {
  const node = getKeyTextNodes({
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

let logScript = 'm`'
document.addEventListener('click', e => {
  if (!e.isTrusted) return

  const node = fromPoint(e.clientX, e.clientY)
  console.log(node)
  if (node.nodeType == 3) {
    logScript += ('\n' + node.data.trim().toLowerCase())
    console.log(logScript + '\n`')
  }
}, {capture: true})

console.log('Monkey Driver is driving :)')

Object.assign(drive, {
  clickable,
  getKeyNodes,
  getKeyTextNodes,
  getKeyInputs,
  getKeyImages,
  getKeyButtonsAndLinks,
  fromPoint,
  textNodeFromPoint,
  getRect,
  getTextBoundingClientRect,
  relax
})

module.exports = {
  drive
}