/**
 * Factory for the action executor. Receives the action handlers through the
 * dependency object - this module performs no imports.
 *
 * @param {object} deps
 * @param {Function} deps.actionRender - 'render' handler
 * @param {Function} deps.actionData - '>' handler
 * @param {Function} deps.actionMix - '[]' handler
 * @param {Function} deps.actionExtendedRender - '+' handler
 * @param {Function} deps.actionSave - '^name' handler
 * @param {Function} deps.actionOverwrite - '^^' handler
 * @returns {Function} The executeActions function
 */
function executeActionsFactory ({ actionRender, actionData, actionMix, actionExtendedRender, actionSave, actionOverwrite }) {



/**
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
                , rawLevelData = nestedData[level] || []
                ;
            // A middle action can collapse the level data to a plain value
            // (e.g. a '>' data helper over primitive data). Wrap it back into
            // an array so the chain keeps composing right-to-left instead of
            // crashing on forEach.
            const levelData = Array.isArray ( rawLevelData )  ?  rawLevelData  :  [ rawLevelData ]

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


return executeActions
} // executeActionsFactory func.

export default executeActionsFactory
