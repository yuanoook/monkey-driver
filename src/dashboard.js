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
        position: absolute;
        margin: auto;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 0.5vw;
        height: 0.5vh;
        border-radius: 10px;
        background: white;
      }
    </style>
    <div class="monkey-driver-dashboard-container">
      Hello, I'm Monkey Driver!
    </div>
  `
  document.body.appendChild(dashboard)
}

function toggleDashboard () {
  if (!hasDashboard()) genDashboard()
  document.body.classList.toggle('monkey-driver-dashboard-open')
}

module.exports = {
  toggleDashboard
}