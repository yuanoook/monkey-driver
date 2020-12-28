const {
  TRACK_TYPES,
  getTrackLogs
} = require('./storage')
const { formatDateTime } = require('./date')
const { getKarma } = require('./karma')

function hasDashboard () {
  return Boolean(document.body.querySelector('.monkey-driver-dashboard'))
}

function genDashboard () {
  const dashboard = document.createElement('div')
  dashboard.classList.add('monkey-driver-dashboard')
  dashboard.innerHTML = `
    <style>
      .monkey-driver-dashboard {
        display: none;
        position: fixed;
        margin: auto;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.1);
        z-index: 10000000000000
      }
      body.monkey-driver-dashboard-open .monkey-driver-dashboard {
        display: block;
      }
      .monkey-driver-dashboard-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: absolute;
        margin: auto;
        padding: 10px;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 80vw;
        height: 80vh;
        border-radius: 10px;
        background: white;
      }
      .monkey-driver-dashboard-container h1 {
        font-size: 1rem;
      }
      .monkey-driver-dashboard-content {
        width: 100%;
        height: 100%;
        overflow: scroll;
        background: rgba(250,250,250);
        padding: 10px;
      }
      .monkey-driver-dashboard-content-karma-result:hover {
        cursor: pointer;
        text-decoration: underline;
      }
    </style>
    <div class="monkey-driver-dashboard-container">
      <h1 > Hello, I'm Monkey Driver! </h1>
      <div class="monkey-driver-dashboard-content">
        <div class="monkey-driver-dashboard-content-actions"></div>
        <div class="monkey-driver-dashboard-content-karma"></div>
      </div>
    </div>
  `

  const clickHandlers = {
    'monkey-driver-dashboard-content-karma-result': function (e) {
      closeDashboard()
      window.monkeyDriver(e.target.innerText.trim())
    }
  }

  dashboard.addEventListener('click', e => {
    for (let key in clickHandlers) {
      if (e.target.classList.contains(key)) {
        clickHandlers[key](e)
      }
    }
  })

  document.body.appendChild(dashboard)
}

function isDashboardOpen () {
  return document.body.classList.contains('monkey-driver-dashboard-open')
}

function closeDashboard () {
  document.body.classList.remove('monkey-driver-dashboard-open')
}

function openDashboard () {
  if (!hasDashboard()) genDashboard()
  document.body.classList.add('monkey-driver-dashboard-open')
  renderActions()
  renderKarma()
}

function renderActions () {
  const actionsNode = document.querySelector('.monkey-driver-dashboard-content-actions')
  const logs = getTrackLogs(TRACK_TYPES.ACTION)
  actionsNode.innerHTML = logs.map(
    ({logAt, content}) => `${
      formatDateTime(logAt)
    } <span class="monkey-driver-dashboard-content-karma-result">${
      content
    }</span>`
  ).join('<br/>')
}

function renderKarma () {
  const karmaResultsNode = document.querySelector('.monkey-driver-dashboard-content-karma')
  const logs = getKarma()
  karmaResultsNode.innerHTML = Object.keys(logs)
    .map(log => `<span class="monkey-driver-dashboard-content-karma-result">${log}</span>`)
    .join('<br/>')
}

function toggleDashboard () {
  return isDashboardOpen() ? closeDashboard() : openDashboard()
}

function refreshDashboard () {
  return isDashboardOpen() && openDashboard()
}

module.exports = {
  isDashboardOpen,
  openDashboard,
  closeDashboard,
  toggleDashboard,
  refreshDashboard
}
