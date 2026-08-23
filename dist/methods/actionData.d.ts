/**
 * Factory for the 'data' action handler. Receives its dependencies through
 * the dependency object - this module performs no imports.
 *
 * @param {object} deps
 * @param {Function} deps._defineDataType - Data type classifier
 * @param {Function} deps.missingHelper - Error-string builder for unavailable helpers
 * @returns {Function} The actionData function
 */
declare function actionDataFactory({ _defineDataType, missingHelper }: {
    _defineDataType: Function;
    missingHelper: Function;
}): Function;
export default actionDataFactory;
