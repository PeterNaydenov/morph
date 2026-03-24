export default _actionSupply;
/**
 * Generator function that supplies actions in a controlled sequence using a stack.
 *
 * Manages the flow of actions through different processing levels, allowing for
 * dynamic action insertion during processing.
 *
 * @param {Object} act - Object containing action arrays organized by level
 * @param {number} level - Maximum processing level
 * @returns {Generator} Generator that yields action objects in sequence
 *
 * @example
 * const generator = _actionSupply(actionSetup, 2);
 * for (const action of generator) {
 *   // Process each action
 * }
 */
declare function _actionSupply(act: any, level: number): Generator;
