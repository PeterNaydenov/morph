/**
 * Factory for the simple-template renderer. Receives its dependencies through
 * the dependency object - this module performs no imports.
 *
 * @param {object} deps
 * @param {Function} deps._chopTemplate - Template chopping function
 * @param {object} deps.settings - Template delimiters
 * @returns {Function} The _renderHolder function
 */
declare function _renderHolderFactory({ _chopTemplate, settings }: {
    _chopTemplate: Function;
    settings: object;
}): Function;
export default _renderHolderFactory;
