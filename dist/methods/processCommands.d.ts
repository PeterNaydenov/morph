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
export function handleDebug(d: string, { handshake, helpers, placeholders, cuts }: {
    handshake: object;
    helpers: object;
    placeholders: any[];
    cuts: any[];
}): any;
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
 * @returns {function} Modified template function
 */
export function handleSet(d: object, { helpers, handshake, placeholders, chop, build, buildDependencies }: {
    helpers: object;
    handshake: object;
    placeholders: any[];
    chop: any[];
    build: Function;
    buildDependencies: object;
}): Function;
/**
 * Handles snippets command to select specific placeholders.
 *
 * @param {string} command - Snippets command
 * @param {object} snippets - Snippets mapping
 * @returns {array|null} Selected placeholders or null
 */
export function handleSnippets(command: string, snippets: object): any[] | null;
