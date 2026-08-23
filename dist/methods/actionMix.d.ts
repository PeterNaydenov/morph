/**
 * Factory for the 'mix' action handler. Receives its dependencies through
 * the dependency object - this module performs no imports.
 *
 * @param {object} deps
 * @param {Function} deps._defineDataType - Data type classifier
 * @param {Function} deps.walk - @peter.naydenov/walk factory
 * @param {Function} deps.missingHelper - Error-string builder for unavailable helpers
 * @returns {Function} The actionMix function
 */
declare function actionMixFactory({ _defineDataType, walk, missingHelper }: {
    _defineDataType: Function;
    walk: Function;
}): Function;
export default actionMixFactory;
