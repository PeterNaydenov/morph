/**
 * Factory for the data-definition step. Receives the walk library through the
 * dependency object - this module performs no imports.
 *
 * @param {object} deps
 * @param {Function} deps.walk - @peter.naydenov/walk factory
 * @returns {Function} The _defineData function
 */
function _defineDataFactory ({ walk }) {



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
function _defineData ( dSource, action ) {
    const nestedData = [];
    let dataDeepLevel = 0;

    // Bare functions are normally resolved upstream (processPlaceholders is
    // the single authoritative resolution point). This guard stays as a safety
    // net for direct/internal callers: resolve instead of letting the
    // structuredClone below throw on an uncopiable function.
    if ( dSource instanceof Function )   return {  dataDeepLevel:0, nestedData:[[dSource()]] }
    if ( dSource == null             )   return {  dataDeepLevel:0, nestedData:[ null ] }
    if ( typeof dSource === 'string' )   return {  dataDeepLevel:0, nestedData:[[dSource]] }

    // Errors as values: functions (or other non-clonable values) inside
    // objects/arrays can not be copied for safe rendering. The placeholder
    // gets an error string instead of the whole render crashing.
    let d
    try   { d = structuredClone ( dSource ) }
    catch { return {  dataDeepLevel:0, nestedData:[ [ `( Error: Render data contains values that can not be copied - functions are not supported inside objects/arrays. )` ] ] } }
 
    // Note: Nest data only if action has '#'
    if ( !action.includes('#') ) {
            nestedData.push ( [d] )
            return { dataDeepLevel:0, nestedData }
        }
        
    /**
 * Callback function for walking through data structure to collect nested objects.
 * 
 * @param {object} params - Walk parameters
 * @param {string} params.key - Current key being processed
 * @param {any} params.value - Current value being processed
 * @param {string} params.breadcrumbs - Path to current value as breadcrumb string
 * @returns {any} Returns the value unchanged
 */
function findObjects ({key, value, breadcrumbs}) {
                    if ( key === breadcrumbs ) {
                            nestedData[0] = [ value ]
                            return value
                       }
                    dataDeepLevel = breadcrumbs.split('/').length-1;
                    if ( !nestedData[dataDeepLevel] )   nestedData[dataDeepLevel] = [];
                    nestedData[dataDeepLevel].push ( value )                     
                    return value
            } // findObjects func.

    walk ({ data:d, objectCallback:findObjects })
    return { dataDeepLevel, nestedData }
    } // _defineData func.


return _defineData
} // _defineDataFactory func.

export default _defineDataFactory
