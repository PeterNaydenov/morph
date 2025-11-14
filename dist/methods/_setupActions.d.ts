export default _setupActions;
/**
 * Parses and organizes template actions into a structured setup by processing level.
 *
 * Converts action strings into structured objects with types and levels. Validates that
 * there are enough level markers (#) for the data depth.
 *
 * @param {string[]} actions - Array of action strings to process
 * @param {number} [dataDeepLevel=10] - Maximum depth level for nested data processing
 *
 * @returns {Object} Object with numeric keys containing arrays of action objects by level
 *
 * @example
 * const setup = _setupActions(['render', '#', 'save:var'], 2);
 * // Returns: { 0: [{type: 'render', name: 'render', level: 0}],
 * //            1: [{type: 'save', name: 'var', level: 1}],
 * //            2: [] }
 */
declare function _setupActions(actions: string[], dataDeepLevel?: number): any;
