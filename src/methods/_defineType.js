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
function _defineDataType ( data ) {
    
    if ( data == null )              return  'null'
    if ( typeof data === 'string'  ) return 'primitive'
    if ( typeof data === 'number'  ) return 'primitive'
    if ( typeof data === 'boolean' ) return 'primitive'
    if ( typeof data === 'function') return 'function'
    if ( data instanceof Array     ) return 'array'
    if ( data instanceof Object    ) return 'object'
    return undefined
} // _defineDataType func.


export default _defineDataType


