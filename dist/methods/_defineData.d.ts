/**
 * Factory for the data-definition step. Receives the walk library through the
 * dependency object - this module performs no imports.
 *
 * @param {object} deps
 * @param {Function} deps.walk - @peter.naydenov/walk factory
 * @returns {Function} The _defineData function
 */
declare function _defineDataFactory({ walk }: {
    walk: Function;
}): Function;
export default _defineDataFactory;
