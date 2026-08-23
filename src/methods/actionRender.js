/**
 * Factory for the 'render' action handler. Receives its dependencies through
 * the dependency object - this module performs no imports.
 *
 * @param {object} deps
 * @param {Function} deps._defineDataType - Data type classifier
 * @param {Function} deps.render - Helper/template renderer
 * @returns {Function} The actionRender function
 */
function actionRenderFactory ({ _defineDataType, render }) {



/**
 * Action 'render'. Renders the current data item with the named helper and
 * writes the result back into the data slice.
 *
 * Write-back rules:
 *   - primitive results replace the data item;
 *   - object data receives the result as its 'text' property;
 *   - a null result marks the item as null, so later steps can skip it.
 *
 * Note: bare functions as data never reach this switch — they are resolved
 * (called) in processPlaceholders before actions execute.
 *
 * @param {object} step - Action step: { name } is the helper name
 * @param {any} theData - Current data item from the level slice
 * @param {object} context - Execution context (see executeActions.js)
 */
function actionRender ({ name }, theData, { helpers, original, dependencies, useHelper, extendArguments, nestedData, level }) {
    const
          dataType = _defineDataType ( theData )
        , isRenderFunction = typeof helpers[name] === 'function'
        , callHelper = ( data, full ) => helpers[name] ({ data, ...extendArguments, full, useHelper: useHelper ( data ) })
        ;

    switch ( dataType ) {
        case 'array':
                theData.forEach ( ( d, i ) => {
                        if ( d == null )   return
                        const text = isRenderFunction  ?  callHelper ( d, original )  :  render ( d, name, helpers, original, dependencies )
                        if ( text == null )                              theData[i] = null
                        else if ( _defineDataType ( d ) === 'object' )   d['text'] = text
                        else                                             theData[i] = text
                    })
                break
        case 'primitive':
                if ( isRenderFunction )   nestedData[level] = callHelper ( theData, theData )
                else                      nestedData[level] = render ( theData, name, helpers, original, dependencies )
                break
        case 'object':
                if ( isRenderFunction )   theData['text'] = callHelper ( theData, theData )
                else                      theData['text'] = render ( theData, name, helpers, original, dependencies )
                break
        } // switch dataType
    } // actionRender func.


return actionRender
} // actionRenderFactory func.

export default actionRenderFactory
