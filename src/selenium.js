const { driver } = require('./driver')

async function callbackScript ({webDriver, script}) {
  const [result, error] = await webDriver.executeAsyncScript(`
    const originalCallback = arguments[arguments.length - 1]
    const callback = result => originalCallback([result])
    ;(async () => {
      try {
        ${script}
      } catch (error) {
        originalCallback([null, error.stack])
      }
    })()
  `)
  if (error) throw new Error(error)
  return result
}

async function bindWebDriver (webDriver, version) {
  version = version || (+ new Date())

  await callbackScript(
    webDriver,
    `callback(await (${installMonkeyDriver})(window, ${version}))`
  )

  webDriver.monkeyDriver = async scripts => callbackScript(
    webDriver,
    `callback(await window.monkeyDriver(${scripts}))`
  )
}

driver.bindWebDriver = bindWebDriver

module.exports = {
  bindWebDriver
}