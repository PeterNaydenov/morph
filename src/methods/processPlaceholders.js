import _defineData     from "./_defineData.js"
import _defineDataType from "./_defineType.js"
import _actionSupply   from "./_actionSupply.js"
import _setupActions   from "./_setupActions.js"
import executeActions  from "./executeActions.js"
import render          from "./render.js"

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
 * @returns {array} Rendered result - one string per data element
 */
function processPlaceholders ({ d, chop, placeholders, original, helpers, dependencies, memory, args, onlySnippets }) {
    const endData = []

    // useHelper factory, shared with executeActions. 'currentData' is the fallback
    // when the helper calls useHelper without its own data.
    const createUseHelperFactory = ( currentData ) => ( targetName, targetData ) => {
            const
                  targetFn = helpers[targetName]
                , isCompiledTemplate = targetFn  &&  typeof targetFn === 'function'  &&  targetFn.length >= 2
                ;
            if ( !targetFn )   return `( Error: Helper '${targetName}' is not available )`

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

            placeholders.forEach ( holder => {
                    const
                          { index, data, action } = holder
                        , dataOnly = !action
                        ;
                    let info = currentDElement;

                    // Data resolution. A name with '/' is a breadcrumb path into the data,
                    // unless the data has it as a literal key. Missing or null steps resolve to [].
                    if ( data && data.includes ( '/' )) {
                            if ( info != null  &&  info.hasOwnProperty ( data ))   info = info[data]
                            else {
                                    data.split ( '/' ).forEach ( step => {
                                            if ( info != null  &&  info.hasOwnProperty ( step ))   info = info[step]
                                            else                                                   info = []
                                        })
                                }
                        }
                    else if ( data === '@all' || data === null || data === '@root' )   info = currentDElement
                    else if ( data )   info = ( info != null )  ?  info[data]  :  null


                    if ( dataOnly ) {   // No actions - place the data directly
                            switch ( _defineDataType ( info )) {
                                case 'function':
                                        cuts[index] = info ()
                                        break
                                case 'primitive':
                                        cuts[index] = info
                                        break
                                case 'array':
                                        if ( _defineDataType ( info[0] ) === 'primitive' )   cuts[index] = info[0]
                                        break
                                case 'object':
                                        if ( info.text )   cuts[index] = info.text
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
                                        cuts[index] = fineData
                                        break
                                case 'object':
                                        if ( fineData['text'] == null )   return
                                        cuts[index] = fineData['text']
                                        break
                                case 'array': {
                                        const itemType = _defineDataType ( fineData[0] )
                                        if ( itemType === 'object' )   cuts[index] = fineData.map ( x => x.text ).join ( '' )
                                        else                           cuts[index] = fineData.join ( '' )
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



export default processPlaceholders


