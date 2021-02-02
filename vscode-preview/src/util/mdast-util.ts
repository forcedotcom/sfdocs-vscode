import * as u from 'unist-builder';
export function all(h, parent) {
    var nodes = parent.children || []
    var length = nodes.length
    var values = []
    var index = -1
    var result
    var head

    while (++index < length) {
        result = one(h, nodes[index], parent)

        if (result) {
            if (index && nodes[index - 1].type === 'break') {
                if (result.value) {
                    result.value = result.value.replace(/^\s+/, '')
                }

                head = result.children && result.children[0]

                if (head && head.value) {
                    head.value = head.value.replace(/^\s+/, '')
                }
            }

            values = values.concat(result)
        }
    }

    return values
}

var own = {}.hasOwnProperty
// Transform an unknown node.
function unknown(h, node) {
    if (text(node)) {
        return h.augment(node, u('text', node.value))
    }

    return h(node, 'div', all(h, node))
}

// Visit a node.
function one(h, node, parent) {
    var type = node && node.type
    var fn = own.call(h.handlers, type) ? h.handlers[type] : h.unknownHandler

    // Fail on non-nodes.
    if (!type) {
        throw new Error('Expected node, got `' + node + '`')
    }

    return (typeof fn === 'function' ? fn : unknown)(h, node, parent)
}

// Check if the node should be renderered as a text node.
function text(node) {
    var data = node.data || {}

    if (
        own.call(data, 'hName') ||
        own.call(data, 'hProperties') ||
        own.call(data, 'hChildren')
    ) {
        return false
    }

    return 'value' in node
}

export function listLoose(node) {
    var loose = node.spread
    var children = node.children
    var length = children.length
    var index = -1

    while (!loose && ++index < length) {
        loose = listItemLoose(children[index])
    }

    return loose
}

export function listItemLoose(node) {
    var spread = node.spread

    return spread === undefined || spread === null
        ? node.children.length > 1
        : spread
}

// Wrap `nodes` with line feeds between each entry.
// Optionally adds line feeds at the start and end.
export function wrap(nodes, loose) {
    var result = []
    var index = -1
    var length = nodes.length

    if (loose) {
        result.push(u('text', '\n'))
    }

    while (++index < length) {
        if (index) {
            result.push(u('text', '\n'))
        }

        result.push(nodes[index])
    }

    if (loose && nodes.length !== 0) {
        result.push(u('text', '\n'))
    }

    return result
}
