/**
 * Factory for the escape utilities. Receives the engine settings (placeholder
 * delimiters) through the dependency object - this module performs no imports.
 *
 * @param {object} deps
 * @param {object} deps.settings - Template delimiters ({@link module:settings})
 * @returns {{ escapeHtml: Function, escapeHelper: Function, neutralizeTags: Function, restoreTags: Function }}
 */
declare function _escapeFactory({ settings }: {
    settings: object;
}): {
    escapeHtml: Function;
    escapeHelper: Function;
    neutralizeTags: Function;
    restoreTags: Function;
};
export default _escapeFactory;
