const {
  TRACK_TYPES,
  getTrackLogs
} = require('./storage')
const { formatDateTime } = require('./date')

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
        width: 50vw;
        height: 50vh;
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
    </style>
    <div class="monkey-driver-dashboard-container">
      <h1 > Hello, I'm Monkey Driver! </h1>
      <div class="monkey-driver-dashboard-content"></div>
    </div>
  `
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
  renderContent()
}

function renderContent () {
  const content = document.querySelector('.monkey-driver-dashboard-content')
  const logs = getTrackLogs(TRACK_TYPES.ACTION)
  content.innerHTML = logs.map(
    ([logAt, logContent]) => `${formatDateTime(logAt)} ${logContent}`
  ).join('<br/>')
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
