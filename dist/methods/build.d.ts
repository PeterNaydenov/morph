/**
 * Factory for the template builder - the heart of the engine. Receives its
 * dependencies through the dependency object - this module performs no imports.
 *
 * @param {object} deps
 * @param {Function} deps._readTemplate - Template reader/validator
 * @param {Function} deps._defineDataType - Data type classifier
 * @param {Function} deps.walk - @peter.naydenov/walk factory (deep copy)
 * @param {Function} deps.processPlaceholders - The rendering core
 * @param {Function} deps.handleDebug - 'debug' command handler
 * @param {Function} deps.handleSet - 'set' command handler
 * @param {Function} deps.handleSnippets - Snippets-selection parser
 * @returns {Function} The build function
 */
declare function buildFactory({ _readTemplate, _defineDataType, walk, processPlaceholders, handleDebug, handleSet, handleSnippets }: {
    _readTemplate: Function;
    _defineDataType: Function;
    walk: Function;
}): Function;
export default buildFactory;
