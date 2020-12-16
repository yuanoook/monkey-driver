function getHighResTime () {
  return performance.timeOrigin + performance.now()
}

function formatDateTime (date) {
  date = date ? new Date(date) : new Date()
  return `${
    date.getFullYear()
  }/${
    date.getMonth() + 1
  }/${
    date.getDate()
  } ${
    date.getHours()
  }:${
    date.getMinutes()
  }:${
    date.getSeconds()
  }.${
    date.getMilliseconds()
  }`
}

module.exports = {
  getHighResTime,
  formatDateTime
}
