export default _defineData;
/**
 * Processes data source based on action requirements and creates nested data structure.
 *
 * Analyzes the data source and action to determine if nested data processing is needed.
 * If action contains '#', it walks through the data structure to collect nested objects.
 *
 * @param {any} dSource - The data source to process (function, null, string, or object)
 * @param {string} action - Action string that may contain '#' indicating nested processing
 *
 * @returns {object} Data processing result containing:
 *   - dataDeepLevel: Maximum nesting level found
 *   - nestedData: Array of nested data arrays organized by level
 *
 * @example
 * // Simple data without nesting
 * const result = _defineData('hello', 'render');
 * // Returns: { dataDeepLevel: 0, nestedData: [['hello']] }
 *
 * @example
 * // Nested data with '#' action
 * const result = _defineData({ user: { name: 'John' } }, 'render:#');
 * // Returns: { dataDeepLevel: 1, nestedData: [[{ name: 'John' }]] }
 */
declare function _defineData(dSource: any, action: string): object;
