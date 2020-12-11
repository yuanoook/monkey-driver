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
        align-items: center;
        justify-content: center;
        position: absolute;
        margin: auto;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 50vw;
        height: 50vh;
        border-radius: 10px;
        background: white;
      }
    </style>
    <div class="monkey-driver-dashboard-container">
      <h1> Hello, I'm Monkey Driver! </h1>
      <div class="monkey-driver-dashboard-content"></div>
    </div>
  `
  document.body.appendChild(dashboard)
}

function renderContent () {
  const content = document.querySelector('.monkey-driver-dashboard-content')
  const logs = getLogs()
  content.innerHTML = logs.join('<br/>')
}

function toggleDashboard ({ getLogs }) {
  if (!hasDashboard()) genDashboard()
  document.body.classList.toggle('monkey-driver-dashboard-open')
  renderContent({ getLogs })
}

module.exports = {
  toggleDashboard
}