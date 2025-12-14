import actionRender                    from './actionRender.js'
import actionData                      from './actionData.js'
import actionMix                       from './actionMix.js'
import actionExtendedRender            from './actionExtendedRender.js'
import _defineDataType                 from "./_defineType.js"
import { actionSave, actionOverwrite } from './actionSave.js'



function executeActions({ nestedData, actSetup, helpers, original, dependencies, memory, dElement, createUseHelper }) {
    let currentDElement = dElement;

    for (let step of actSetup) {
        let
            { type, name, level } = step
            , levelData = nestedData[level] || []
            ;

        // If levelData is undefined, we can't loop. But it should be [] from _defineData?
        // nestedData[level] might be undefined?
        // build.js said: `let levelData = nestedData[level] || []`

        levelData.forEach((theData, iData) => {
            const context = {
                helpers
                , original
                , dependencies
                , memory
                , useHelper: createUseHelper
                , nestedData
                , level
                , iData
                , extendArguments: { dependencies, memory }
            }

            switch (type) {
                case 'render':
                    actionRender(step, theData, context)
                    break
                case 'data':
                    actionData(step, theData, context)
                    break
                case 'mix':
                    actionMix(step, theData, context)
                    break
                case 'save':
                    actionSave(step, theData, context)
                    break
                case 'overwrite':
                    currentDElement = actionOverwrite(step, theData)
                    break
                case 'route':
                    // Deprecated, removed as per refactoring plan
                    break
                case 'extendedRender':
                    actionExtendedRender(step, theData, context)
                    break
            }
        })
    }

    return currentDElement
}

export default executeActions
