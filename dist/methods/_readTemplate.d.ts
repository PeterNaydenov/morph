/**
 * Factory for the template reader. Receives its dependencies through the
 * dependency object - this module performs no imports.
 *
 * @param {object} deps
 * @param {object} deps.settings - Template delimiters
 * @param {Function} deps._chopTemplate - Template chopping function
 * @param {Function} deps.escapeHelper - Built-in 'escape' helper
 * @param {Function} deps.restoreTags - Restores neutralized placeholder tags
 * @returns {Function} The _readTemplate function
 */
declare function _readTemplateFactory({ settings, _chopTemplate, escapeHelper, restoreTags }: {
    settings: object;
    _chopTemplate: Function;
    escapeHelper: Function;
    restoreTags: Function;
}): Function;
export default _readTemplateFactory;
