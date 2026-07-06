import actionRender                    from './actionRender.js'
import actionData                      from './actionData.js'
import actionMix                       from './actionMix.js'
import actionExtendedRender            from './actionExtendedRender.js'
import { actionSave, actionOverwrite } from './actionSave.js'



/**
 * Executes the action chain of a placeholder over the prepared nested data.
 *
 * Actions arrive from the action supplier level by level. Each action type has a
 * dedicated handler that writes its result into `nestedData`. Only 'overwrite'
 * replaces the current data element and hands it back to the caller.
 *
 * @param {object} params - Parameters object
 * @param {array} params.nestedData - Data slices organized by depth level
 * @param {Generator} params.actSetup - Action supplier (see _actionSupply.js)
 * @param {object} params.helpers - Helper functions
 * @param {any} params.original - Original data context
 * @param {object} params.dependencies - Injected dependencies
 * @param {object} params.memory - Internal memory state ('save' action writes here)
 * @param {any} params.dElement - Current top-level data element
 * @param {function} params.createUseHelper - Factory for useHelper functions
 * @returns {any} The (possibly overwritten) data element
 */
function executeActions ({ nestedData, actSetup, helpers, original, dependencies, memory, dElement, createUseHelper }) {
    let currentDElement = dElement;

    for ( const step of actSetup ) {
            const
                  { type, level } = step
                , levelData = nestedData[level] || []
                ;

            levelData.forEach ( ( theData, iData ) => {
                        const context = {
                                          helpers
                                        , original
                                        , dependencies
                                        , memory
                                        , useHelper : createUseHelper
                                        , nestedData
                                        , level
                                        , iData
                                        , extendArguments : { dependencies, memory }
                                }

                        switch ( type ) {
                                case 'render':
                                        actionRender ( step, theData, context )
                                        break
                                case 'data':
                                        actionData ( step, theData, context )
                                        break
                                case 'mix':
                                        actionMix ( step, theData, context )
                                        break
                                case 'save':
                                        actionSave ( step, theData, context )
                                        break
                                case 'overwrite':
                                        currentDElement = actionOverwrite ( step, theData )
                                        break
                                case 'extendedRender':
                                        actionExtendedRender ( step, theData, context )
                                        break
                            }
                }) // forEach levelData
        } // for actSetup

    return currentDElement
} // executeActions func.



export default executeActions


