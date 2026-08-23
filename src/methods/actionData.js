import _defineDataType from "./_defineType.js"



/**
 * Action 'data' ('>'). Calls the named helper to transform the data before
 * rendering. The result replaces the level data.
 *
 * Function data provides its value by being called. The uncalled item stays
 * available to the helper as the 'full' argument.
 *
 * Note: bare functions as data never reach this switch — they are resolved
 * (called) in processPlaceholders before actions execute. Functions nested
 * inside objects/arrays are not supported (see `structuredClone` in
 * _defineData).
 *
 * @param {object} step - Action step: { name } is the helper name
 * @param {any} theData - Current data item from the level slice
 * @param {object} context - Execution context (see executeActions.js)
 */
function actionData ({ name }, theData, { helpers, extendArguments, nestedData, level, useHelper }) {
    // Errors as values: a missing helper becomes the placeholder's value
    // instead of crashing the whole render.
    if ( !helpers[name] ) {
            nestedData[level] = `( Error: Helper '${name}' is not available )`
            return
        }
    const callHelper = ( data, full, uhContext ) => helpers[name] ({ data, ...extendArguments, full, useHelper: useHelper ( uhContext ) })

    switch ( _defineDataType ( theData )) {
        case 'array':
                theData.forEach ( ( d, i ) => {
                        const value = ( d instanceof Function )  ?  d ()  :  d
                        theData[i] = callHelper ( value, d, d )
                    })
                break
        case 'object':
                nestedData[level] = [ callHelper ( theData, theData, theData ) ]
                break
        case 'primitive':
                nestedData[level] = callHelper ( theData, theData, theData )
                break
    } // switch dataType
} // actionData func.



export default actionData


