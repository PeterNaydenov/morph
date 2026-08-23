/**
 * Factory for the action-supply generator. Receives the stack library through
 * the dependency object - this module performs no imports.
 *
 * @param {object} deps
 * @param {Function} deps.stack - @peter.naydenov/stack factory
 * @returns {Function} The _actionSupply generator function
 */
declare function _actionSupplyFactory({ stack }: {
    stack: Function;
}): Function;
export default _actionSupplyFactory;
