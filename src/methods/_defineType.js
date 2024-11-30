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


