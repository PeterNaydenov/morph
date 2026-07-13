/**
 * Parses and validates a template description object.
 *
 * Extracts placeholders, validates helpers, and prepares template for building.
 *
 * @param {object} tpl - Template description object
 * @param {string} tpl.template - Template string with placeholders
 * @param {object} [tpl.helpers={}] - Optional helper functions
 * @param {object} [tpl.handshake] - Optional example data
 * @param {boolean} [tpl.escape=false] - Optional. HTML-escape the output of data-only placeholders
 *
 * @returns {object} Template parsing result containing:
 *   - hasError: Error message or null
 *   - placeholders: Array of placeholder objects
 *   - chop: Array of template parts
 *   - helpers: Helper functions object (includes the built-in 'escape' helper)
 *   - handshake: Example data object
 *   - snippets: Object mapping snippet names to placeholders
 *   - escape: Escape flag of the template
 */
declare function _readTemplate(tpl: {
    template: string;
    helpers?: object;
    handshake?: object;
    escape?: boolean;
}): object;
export default _readTemplate;
