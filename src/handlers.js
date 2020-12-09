const click = {
  filter: ({node, content}) => {
    return !content ||
      node.innerText.toLowerCase().includes(content.toLowerCase())
  },
  prioritize: (nodes, content) => {
    return nodes
  },
  run: (node) => {
    node.click()
    return true
  }
}

const input = {
  selector: 'input, textarea',
  run: (node, content) => {
    node.value = content
    // todo: node trigger change event
  }
}

const textarea = {

}

const empty = {

}

const check = {

}

const uncheck = {

}

const handlers = {
  click,
  input,
  textarea,
  empty,
  check,
  uncheck
}

module.exports = handlers
