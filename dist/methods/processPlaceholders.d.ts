/**
 * Factory for the placeholder processor - the rendering core. Receives its
 * dependencies through the dependency object - this module performs no imports.
 *
 * @param {object} deps
 * @param {Function} deps._defineData - Data-definition step
 * @param {Function} deps._defineDataType - Data type classifier
 * @param {Function} deps._actionSupply - Action supplier generator
 * @param {Function} deps._setupActions - Action-chain parser
 * @param {Function} deps.executeActions - Action executor
 * @param {Function} deps.render - Helper/template renderer
 * @param {Function} deps.escapeHtml - HTML escaper for data-only placeholders
 * @param {Function} deps.neutralizeTags - Placeholder-tag neutralizer ('curry' renders)
 * @param {Function} deps.missingHelper - Error-string builder for unavailable helpers
 * @returns {Function} The processPlaceholders function
 */
declare function processPlaceholdersFactory({ _defineData, _defineDataType, _actionSupply, _setupActions, executeActions, render, escapeHtml, neutralizeTags, missingHelper }: {
    _defineData: Function;
    _defineDataType: Function;
    _actionSupply: Function;
    _setupActions: Function;
    executeActions: Function;
    render: Function;
    escapeHtml: Function;
    neutralizeTags: Function;
    missingHelper: Function;
}): Function;
export default processPlaceholdersFactory;
