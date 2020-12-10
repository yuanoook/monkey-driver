const fs = require('fs')
const path = require('path')
const beautify = require('js-beautify').js
const exec = sh => require('child_process').execSync(sh)

const output = 'monkeyDriver.js'
const allowList = [
  'clickable.js',
  'point.js',
  'getNodes.js',
  'handlers.js',
  'relax.js',
  'driver.js'
]
const read = (f, dir='') => fs.readFileSync(
  path.resolve(__dirname, dir, f),
  {encoding: 'utf-8'}
)
const files = fs.readdirSync(path.resolve(__dirname, '../src')).filter(
  f => allowList.some(r => r.test ? r.test(f) : r === f)
).sort((a, b) => allowList.indexOf(a) - allowList.indexOf(b))

const modules = files.map(f => read(f, '../src')).join('\n')
const placeholder = /[^\n]*\/\*\*\*\*\* Your Code Here \*\*\*\*\*\//
const version = /(\/\/ @version\s*)[^\n]*/
const requires = /[^\n]*([\{\[][^\}\]]*[\}\]]|[^\n]*)\s*=\s*require\(['"][^\n]*/g
const exportsReg = /module.exports\s*=\s*([\{\[][^\}\]]*[\}\]]|[^\n]*)/g
const content = read('template.js')
  .replace(placeholder, modules)
  .replace(version, `$1${new Date().getTime()}`)
  .replace(requires, '')
  .replace(exportsReg, '')

exec(`cd ${__dirname}/..; mkdir dist || true;`)
fs.writeFileSync(
  path.resolve(__dirname, '../dist', output),
  beautify(content, {indent_size: 2, space_in_empty_paren: true})
)
console.log(files)
