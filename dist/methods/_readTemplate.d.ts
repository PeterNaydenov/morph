export default _readTemplate;
/**
 * Parses and validates a template description object.
 *
 * Extracts placeholders, validates helpers, and prepares template for building.
 *
 * @param {object} tpl - Template description object
 * @param {string} tpl.template - Template string with placeholders
 * @param {object} [tpl.helpers={}] - Optional helper functions
 * @param {object} [tpl.handshake] - Optional example data
 *
 * @returns {object} Template parsing result containing:
 *   - hasError: Error message or null
 *   - placeholders: Array of placeholder objects
 *   - chop: Array of template parts
 *   - helpers: Helper functions object
 *   - handshake: Example data object
 *   - snippets: Object mapping snippet names to placeholders
 */
declare function _readTemplate(tpl: {
    template: string;
    helpers?: object;
    handshake?: object;
}): object;
