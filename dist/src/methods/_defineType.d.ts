export default _defineDataType;
/**
 * Determines the data type of a value for template processing.
 *
 * @param {any} data - Value to type-check
 * @returns {string|undefined} Returns one of: 'null', 'primitive', 'function', 'array', 'object', or undefined
 *
 * @example
 * _defineDataType(null); // 'null'
 * _defineDataType('hello'); // 'primitive'
 * _defineDataType([1,2,3]); // 'array'
 * _defineDataType({}); // 'object'
 * _defineDataType(() => {}); // 'function'
 */
declare function _defineDataType(data: any): string | undefined;
