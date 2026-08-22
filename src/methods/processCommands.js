import { escapeHelper } from './_escape.js'

/**
 * Handles debug commands for template inspection.
 *
 * @param {string} d - Debug instruction
 * @param {object} context - Context object
 * @param {object} context.handshake - Example data
 * @param {object} context.helpers - Helper functions
 * @param {array} context.placeholders - Placeholder definitions
 * @param {array} context.cuts - Chopped template parts
 * @returns {any} Debug result or error message
 */
function handleDebug(d, { handshake, helpers, placeholders, cuts }) {
    switch (d) {
        case 'raw':
            return cuts.join('')
        case 'demo':
            if (!handshake) return `Error: No handshake data.`
            return handshake // Caller handles rendering handshake
        case 'handshake':
            if (!handshake) return `Error: No handshake data.`
            return structuredClone(handshake)
        case 'helpers':
            // List the template's own helpers. Built-ins stay hidden unless overridden.
            return Object.keys(helpers).filter(k => helpers[k] !== escapeHelper).join(', ')
        case 'placeholders':
            return placeholders.map(h => cuts[h.index]).join(', ')
        case 'count':
            return placeholders.length
        default:
            return `Error: Wrong instruction "${d}". Available instructions: raw, demo, handshake, helpers, placeholders, count.`
    }
}

/**
 * Handles the 'set' command to modify template properties.
 *
 * @param {object} d - Modification data
 * @param {object} context - Context object
 * @param {object} context.helpers - Current helper functions
 * @param {object} context.handshake - Current handshake data
 * @param {array} context.placeholders - Current placeholders
 * @param {array} context.chop - Current chopped template
 * @param {function} context.build - Build function
 * @param {object} context.buildDependencies - Build dependencies
 * @param {boolean} [context.escape] - Escape flag of the template
 * @returns {function} Modified template function
 */
function handleSet(d, { helpers, handshake, placeholders, chop, build, buildDependencies, escape }) {
    if (typeof d !== 'object' || !d) return `Error: 'set' command requires an object with placeholders, helpers, handshake.`

    const newHelpers = { ...helpers, ...(d.helpers || {}) }
    const newHandshake = handshake ? { ...handshake, ...(d.handshake || {}) } : d.handshake || {}
    const newChop = [...chop]

    if (d.placeholders) {
        for (const [k, v] of Object.entries(d.placeholders)) {
            // Placeholders are addressed by position ('0', '1', ...) or by name
            const holder = !isNaN(k) ? placeholders[k] : placeholders.find(p => p.name === k)
            if (!holder) return `Error: Placeholder "${k}" does not exist in the template.`
            newChop[holder.index] = v
        }
    }

    const newTemplateStr = newChop.join('');
    const newTpl = {
        template: newTemplateStr,
        helpers: newHelpers,
        handshake: newHandshake,
        escape
    }

    const result = build(newTpl, false, buildDependencies)
    return typeof result === 'function' ? result : () => result
}

/**
 * Handles snippets command to select specific placeholders.
 *
 * @param {string} command - Snippets command ('snippets' or 'snippets: a, b')
 * @param {object} snippets - Snippets mapping (by index and by name)
 * @returns {array|null|string} Selected placeholders, null for 'all snippets',
 *   or an error message when the selection is malformed or unknown.
 */
function handleSnippets(command, snippets) {
    if (!command.includes(':'))   return null // Indicates 'all snippets' or logic handled by caller

    const selection = command.split(':').slice(1).join(':').trim()
    if (selection === '')
            return `Error: Command "snippets:" requires a comma-separated list of snippet names or indexes.`

    const selected = []
    for (const item of selection.split(',').map(t => t.trim())) {
            if (item === '')
                    return `Error: Command "snippets" received an empty snippet name. Use a comma-separated list of names or indexes.`
            const found = snippets[item]
            if (!found)   return `Error: Snippet "${item}" does not exist in the template.`
            selected.push(found)
        }
    return selected
}

export { handleDebug, handleSet, handleSnippets }
