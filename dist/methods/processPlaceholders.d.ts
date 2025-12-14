export default processPlaceholders;
/**
 * Processes placeholders in the template with provided data and context.
 *
 * @param {object} params - Parameters object
 * @param {array} params.d - Data array to process
 * @param {array} params.chop - Chopped template parts
 * @param {array} params.placeholders - Placeholder definitions
 * @param {any} params.original - Original data context
 * @param {object} params.helpers - Helper functions
 * @param {object} params.dependencies - Injected dependencies
 * @param {object} params.memory - Internal memory state
 * @param {array} params.args - Additional arguments
 * @param {boolean} params.onlySnippets - Whether to process only snippets
 * @returns {array} Processed template parts
 */
declare function processPlaceholders({ d, chop, placeholders, original, helpers, dependencies, memory, args, onlySnippets }: {
    d: any[];
    chop: any[];
    placeholders: any[];
    original: any;
    helpers: object;
    dependencies: object;
    memory: object;
    args: any[];
    onlySnippets: boolean;
}): any[];
