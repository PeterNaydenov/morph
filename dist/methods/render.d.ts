/**
 * Factory for the helper/template renderer. Receives its dependencies through
 * the dependency object - this module performs no imports.
 *
 * @param {object} deps
 * @param {Function} deps._renderHolder - Simple-template renderer (string helpers)
 * @param {Function} deps.missingHelper - Error-string builder for unavailable helpers
 * @returns {Function} The render function
 */
declare function renderFactory({ _renderHolder, missingHelper }: {
    _renderHolder: Function;
    missingHelper: Function;
}): Function;
export default renderFactory;
