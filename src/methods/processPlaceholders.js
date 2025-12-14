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
 * @param {boolean} params.onlySnippets - Whether to process only snippets
 * @returns {array} Processed template parts
 */
function processPlaceholders ({ d, chop, placeholders, original, helpers, dependencies, memory, args, onlySnippets }) {
    const endData = []
    // We need a factory for useHelper.
    // It depends on 'currentData'. But here we are iterating 'd'.

    // Helper factory to share with executeActions
    const createUseHelperFactory = (currentData) => (targetName, targetData) => {
        let
            targetFn = helpers[targetName]
            , isCompiledTemplate = targetFn && typeof targetFn === 'function' && targetFn.length >= 2
            ;
        if (!targetFn) return `( Error: Helper '${targetName}' is not available )`

        if (isCompiledTemplate) {
            try {
                return targetFn('render', targetData || currentData, dependencies)
            }
            catch (e) {
                return render(targetData || currentData, targetName, helpers, original, dependencies, ...args)
            }
        }
        return render(targetData || currentData, targetName, helpers, original, dependencies, ...args)
    }


    d.forEach(dElement => {
        let
            cuts = structuredClone(chop)
            , currentDElement = dElement // Can be updated by overwrite
            ;

        placeholders.forEach(holder => {
            const
                { index, data, action } = holder
                , dataOnly = !action
                , mem = structuredClone(memory)
                ;
            let info = currentDElement;

            // Data Resolution
            if (data && data.includes('/')) {
                if (info.hasOwnProperty(data)) {
                    info = info[data]
                }
                else {
                    data.split('/').forEach(d => {
                        if (info.hasOwnProperty(d)) info = info[d]
                        else info = [] // Bug in original? info = [] then info['next'] crashes? 
                        // Original: else info = []. 256. 
                        // If info is [], next iteration info['key'] is undefined.
                        // So safe.
                    })
                }
            }
            else if (data === '@all' || data === null || data === '@root') info = currentDElement
            else if (data) info = info[data]


            if (dataOnly) {
                const type = _defineDataType(info);
                switch (type) {
                    case 'function':
                        cuts[index] = info()
                        break
                    case 'primitive':
                        cuts[index] = info
                        break
                    case 'array':
                        if (_defineDataType(info[0]) === 'primitive') cuts[index] = info[0]
                        break
                    case 'object':
                        if (info.text) cuts[index] = info.text
                        break
                }
            }
            else {
                // Logic for data processing via actions
                let
                    { dataDeepLevel, nestedData } = _defineData(info, action)
                    , actSetup = _actionSupply(_setupActions(action, dataDeepLevel), dataDeepLevel)
                    ;

                const createUseHelper = createUseHelperFactory(info); // use info as context? 
                // In build.js it was `d` (the item from levelData).
                // `executeActions` passes `theData` to `createUseHelper`.

                currentDElement = executeActions({
                    nestedData
                    , actSetup
                    , helpers
                    , original
                    , dependencies
                    , memory
                    , dElement: currentDElement
                    , createUseHelper: createUseHelperFactory
                })

                // Flatten Step
                if (nestedData instanceof Array && nestedData.length === 1 && nestedData[0] instanceof Array) nestedData = nestedData[0]
                if (nestedData[0] == null) return

                let
                    accType = _defineDataType(nestedData[0])
                    , fineData = nestedData[0]
                    ;

                switch (accType) {
                    case 'primitive':
                        if (fineData == null) return
                        cuts[index] = fineData
                        break
                    case 'object':
                        if (fineData['text'] == null) return
                        cuts[index] = fineData['text']
                        break
                    case 'array':
                        const aType = _defineDataType(fineData[0])
                        if (aType === 'object') cuts[index] = fineData.map(x => x.text).join('')
                        else cuts[index] = fineData.join('')
                        break
                }
            }
        }) // placeholders loop

        if (onlySnippets) endData.push(placeholders.map(x => cuts[x.index]).join('<~>'))
        else endData.push(cuts.join(''))

    }) // d.forEach

    return endData
}

export default processPlaceholders
