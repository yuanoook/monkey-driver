// This function should not be called
function genSelector(node) {
  if (!node.tagName) return []

  const identifiers = [
    node.tagName,
    node.id && `#${node.id}`,
    ...(
      node.classList
        ? Array.from(node.classList).map(c => `.${c}`)
        : []
    )
  ].filter(i => i)

  const identity = identifiers.join('')

  if (!node.parentNode || !node.parentNode.tagName) return [identity]

  return [...genSelector(node.parentNode), '>' , identity]
}