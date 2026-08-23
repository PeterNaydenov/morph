/**
 * Factory for the placeholder processor - the rendering core. Receives its
 * dependencies through the dependency object - this module performs no imports.
 *
 * @param {object} deps
 * @param {Function} deps._defineData - Data-definition step
 * @param {Function} deps._defineDataType - Data type classifier
 * @param {Function} deps._actionSupply - Action supplier generator
 * @param {Function} deps._setupActions - Action-chain parser
 * @param {Function} deps.executeActions - Action executor
 * @param {Function} deps.render - Helper/template renderer
 * @param {Function} deps.escapeHtml - HTML escaper for data-only placeholders
 * @param {Function} deps.neutralizeTags - Placeholder-tag neutralizer ('curry' renders)
 * @param {Function} deps.missingHelper - Error-string builder for unavailable helpers
 * @returns {Function} The processPlaceholders function
 */
function processPlaceholdersFactory ({ _defineData, _defineDataType, _actionSupply, _setupActions, executeActions, render, escapeHtml, neutralizeTags, missingHelper }) {

/**
 * Processes placeholders in the template with provided data and context.
 *
 * @param {object} params - Parameters object
 * @param {array} params.d - Data array to process
 * @param {array} params.chop - Chopped template parts
 * @param {array} params.placeholders - Placeholder definitions
 * @param {any} params.original - Original data context
 * @param {object} params.helpers - Helper functions
 * @param {object} params.dependencies - Injected dependencies
 * @param {object} params.memory - Internal memory state
 * @param {array} params.args - Additional arguments
 * @param {boolean} params.onlySnippets - Whether to render only the selected placeholders
 * @param {boolean} [params.escape] - HTML-escape the output of data-only placeholders
 * @param {boolean} [params.neutralize] - Neutralize placeholder tags in the output values ('curry' render)
 * @returns {array} Rendered result - one string per data element
 */
function processPlaceholders ({ d, chop, placeholders, original, helpers, dependencies, memory, args, onlySnippets, escape = false, neutralize = false }) {
    const endData = []

    // useHelper factory, shared with executeActions. 'currentData' is the fallback
    // when the helper calls useHelper without its own data.
    // A 'compiled template' is the render function returned by build(). It carries
    // a __isMorphTemplate marker so we never confuse it with a user helper that
    // happens to declare 2+ positional parameters.
    const createUseHelperFactory = ( currentData ) => ( targetName, targetData ) => {
            const
                  targetFn = helpers[targetName]
                , isCompiledTemplate = targetFn  &&  typeof targetFn === 'function'  &&  targetFn.__isMorphTemplate === true
                ;
            if ( !targetFn )   return missingHelper ( targetName )

            if ( isCompiledTemplate ) {
                    try   { return targetFn ( 'render', targetData || currentData, dependencies ) }
                    catch ( e ) { return render ( targetData || currentData, targetName, helpers, original, dependencies, ...args ) }
                }
            return render ( targetData || currentData, targetName, helpers, original, dependencies, ...args )
        } // createUseHelperFactory func.


    d.forEach ( dElement => {
            let
                  cuts = structuredClone ( chop )
                , currentDElement = dElement   // 'overwrite' action can replace it
                ;

            // Single write point for placeholder results. Escaping covers data-only
            // placeholders (helper output is the template author's code - trusted).
            // Neutralizing covers every write - data can not inject placeholders via 'curry'.
            const place = ( holder, value ) => {
                    let out = value
                    if ( escape  &&  !holder.action  &&  !holder.raw )   out = escapeHtml ( out )
                    if ( neutralize )   out = neutralizeTags ( out )
                    cuts[holder.index] = out
                } // place func.

            placeholders.forEach ( holder => {
                    const
                          { data, action } = holder
                        , dataOnly = !action
                        ;
                    let info = currentDElement;

                    // Data resolution. A name with '/' is a breadcrumb path into the data,
                    // unless the data has it as a literal key. Missing or null steps
                    // resolve to null - a missing value keeps the placeholder raw.
                    // (An explicitly provided empty array still renders as ''.)
                    if ( data && data.includes ( '/' )) {
                            if ( info != null  &&  info.hasOwnProperty ( data ))   info = info[data]
                            else {
                                    data.split ( '/' ).forEach ( step => {
                                            if ( info != null  &&  info.hasOwnProperty ( step ))   info = info[step]
                                            else                                                   info = null
                                        })
                                }
                        }
                    else if ( data === '@all' || data === null || data === '@root' )   info = currentDElement
                    else if ( data )   info = ( info != null )  ?  info[data]  :  null

                    // The single point where function data is resolved: called once
                    // per render, per element. Both the data-only path and the
                    // action chain see plain values from here on. (Bare functions
                    // nested deeper are not supported - see _defineData.)
                    if ( _defineDataType ( info ) === 'function' )   info = info ()

                    if ( dataOnly ) {   // No actions - place the data directly
                            switch ( _defineDataType ( info )) {
                                case 'primitive':
                                        place ( holder, info )
                                        break
                                case 'array':
                                        // One rule everywhere: an array placeholder
                                        // renders as its elements joined - same as
                                        // the action-chain and mix paths below.
                                        if ( _defineDataType ( info[0] ) === 'object' )   place ( holder, info.map ( x => x.text ).join ( '' ))
                                        else                                              place ( holder, info.join ( '' ))
                                        break
                                case 'object':
                                        // Match the action-chain path and the
                                        // string-helper path: only null/undefined
                                        // drop the placeholder. A value of 0
                                        // (or false) is real data and must render.
                                        if ( info.text != null )   place ( holder, info.text )
                                        break
                            }
                        }
                    else {   // Run the action chain over the data
                            let { dataDeepLevel, nestedData } = _defineData ( info, action )
                            const actSetup = _actionSupply ( _setupActions ( action, dataDeepLevel ), dataDeepLevel )

                            currentDElement = executeActions ({
                                                          nestedData
                                                        , actSetup
                                                        , helpers
                                                        , original
                                                        , dependencies
                                                        , memory
                                                        , dElement : currentDElement
                                                        , createUseHelper : createUseHelperFactory
                                                })

                            // The action chain leaves the result at the root level. Unwrap it.
                            if ( nestedData instanceof Array  &&  nestedData.length === 1  &&  nestedData[0] instanceof Array )   nestedData = nestedData[0]
                            if ( nestedData[0] == null )   return

                            const fineData = nestedData[0]
                            switch ( _defineDataType ( fineData )) {
                                case 'primitive':
                                        place ( holder, fineData )
                                        break
                                case 'object':
                                        if ( fineData['text'] == null )   return
                                        place ( holder, fineData['text'] )
                                        break
                                case 'array': {
                                        const itemType = _defineDataType ( fineData[0] )
                                        if ( itemType === 'object' )   place ( holder, fineData.map ( x => x.text ).join ( '' ))
                                        else                           place ( holder, fineData.join ( '' ))
                                        break
                                    }
                            }
                        }
                }) // forEach placeholders

            if ( onlySnippets )   endData.push ( placeholders.map ( x => cuts[x.index] ).join ( '<~>' ))
            else                  endData.push ( cuts.join ( '' ))

        }) // forEach d

    return endData
    } // processPlaceholders func.


return processPlaceholders
} // processPlaceholdersFactory func.

export default processPlaceholdersFactory
