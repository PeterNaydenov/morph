import _chopTemplate     from "./_chopTemplates.js"
import _defineData       from "./_defineData.js"
import _actionSupply     from "./_actionSupply.js"
import _setupActions     from "./_setupActions.js"
import _readTemplate     from "./_readTemplate.js"
import _renderHolder     from './_renderHolder.js'
import _defineDataType   from "./_defineType.js"
import render            from './render.js'


import walk from '@peter.naydenov/walk'

/**
 * @callback UseHelperFn
 * @param {string} name - Name of the helper to call.
 * @param {any} [data] - Optional data override.
 * @returns {any} Result of the helper call.
 */

/**
 * @callback HelperFn
 * @param {object} args
 * @param {any} args.data - The data context.
 * @param {object} args.dependencies - Injected dependencies.
 * @param {any} [args.full] - Full data context.
 * @param {UseHelperFn} [args.useHelper] - Function to call other helpers.
 * @param {object} [args.memory] - internal memory state.
 * @returns {any} Rendered output.
 */

/**
 * @typedef {Object} Template
 * @property {string} template - Data to be rendered;
 * @property {Object.<string, HelperFn|string>} [helpers] - Optional. Object with helper functions or simple templates for this template; 
 * @property {object} [handshake] - Optional. Example for data to be rendered with;
 */

/**
 * @typedef {Array}  tupleResult
 * @property {boolean} 0 - Indicates success (true) or failure (false).
 * @property {function} 1 - The rendering function or an error function.
 */



/**
 * 
 * @param {Template} tpl - template definition;
 * @param {boolean} [extra] - Optional. How to receive the answer - false:as a string(answer) or true: as tuple[success, answer];
 * @param {object} [buildDependencies] - Optional. External dependencies injected;
 * @returns {function|tupleResult} - rendering function
 */
function build  ( tpl, extra=false, buildDependencies={} ) {
        let { hasError, placeholders, chop, helpers, handshake, snippets } = _readTemplate ( tpl );
        
        if ( hasError ) {
                        function fail () { return hasError }
                        return extra ? [ false, fail ] : fail
                }
        else {  // If NO Error:
                const originalPlaceholders = structuredClone(placeholders);
                // *** Template recognition complete. Start building the rendering function -->
                /**
                 * Processes template rendering commands with provided data, dependencies, and optional post-processing functions.
                 *
                 * @function success
                 * @typedef { 'render' | 'debug' | 'snippets' | 'curry' | 'set' } Command
                 * @param {Command} [command='render'] - The command to execute. Supported commands: 'render', 'debug', 'snippets', 'curry', 'set', or 'snippets:<names>'.
                 * @param {Object|string} [d={}] - The data object to render, or a string instruction ('raw', 'demo', 'handshake', 'placeholders', 'count').
                 * @param {Object} [dependencies={}] - Additional dependencies to be merged with internal dependencies.
                 * @param {...any} args - Optional post-processing functions to apply to the rendered output.
                 * @returns {string|Array[]|function} The rendered template, snippets, data, or new function depending on the command and input.
                 *
                 * @throws {Error} If an unsupported command or instruction is provided.
                 *
                 * @example
                 * // Render a template with data
                 * success('render', { name: 'Alice' }, { helperFn });
                 *
                 * @example
                 * // Get raw template
                 * success('debug', 'raw');
                 *
                 * @example
                 * // Get count of remaining placeholders
                 * success('debug', 'count');
                 *
                 * @example
                 * // Render only specific snippets
                 * success('snippets:header,footer', { ... });
                 *
                 * @example
                 * // Curry partial data and get new render function
                 * const curried = success('curry', { partial: 'data' });
                 * curried('render', { more: 'data' });
                 *
                 * @example
                 * // Set placeholders and get modified template
                 * const modified = success('set', { placeholders: { key: 'value' } });
                 */
                function success(command = 'render', d = {}, dependencies = {}, ...args) {
                        const cuts = structuredClone(chop)
                        let onlySnippets = false;
                        if (typeof command !== 'string') return `Error: Wrong command "${command}". Available commands: render, debug, snippets, set, curry.`
                        if (!['render', 'debug', 'snippets', 'set', 'curry'].includes(command) && !command.startsWith('snippets')) return `Error: Wrong command "${command}". Available commands: render, debug, snippets, set, curry.`

                        if (command.startsWith('snippets') && command.includes(':')) {
                                onlySnippets = true
                                let snippetNames = command.split(':')
                                        .slice(1)[0]
                                        .trim()
                                        .split(',')
                                        .map(t => t.trim())
                                placeholders = snippetNames.map(item => snippets[item])
                        }
                        else if (command === 'snippets') {
                                onlySnippets = true
                        }
                        else if (command === 'set') {
                                if (typeof d !== 'object' || !d) return `Error: 'set' command requires an object with placeholders, helpers, handshake.`
                                // Merge helpers
                                const newHelpers = { ...helpers, ...(d.helpers || {}) }

                                // Merge handshake
                                const newHandshake = handshake ? { ...handshake, ...(d.handshake || {}) } : d.handshake || {}
                                // Modify chop for placeholders
                                const newChop = [...chop]
                                if (d.placeholders) {
                                        Object.entries(d.placeholders).forEach(([k, v]) => {
                                                if (!isNaN(k)) { // If k is a number
                                                        let index = placeholders[k].index;
                                                        newChop[index] = v
                                                } // if k is a number
                                                else { // If k is a string
                                                        let plx = placeholders.find(p => p.name === k)
                                                        newChop[plx.index] = v
                                                }
                                        }) // placeholders
                                } // if d.placeholders
                                const newTemplateStr = newChop.join('');
                                const newTpl = {
                                        template: newTemplateStr,
                                        helpers: newHelpers,
                                        handshake: newHandshake
                                }
                                const result = build(newTpl, false, buildDependencies)
                                return typeof result === 'function' ? result : () => result
                        } else if (command === 'curry') {
                                // Render the template with current data
                                const rendered = success('render', d, dependencies, ...args)
                                // Create new template with rendered as template, keep helpers and handshake
                                const newTpl = {
                                        template: rendered,
                                        helpers,
                                        handshake
                                }
                                const newFn = build(newTpl, false, buildDependencies)
                                return newFn
                        } else placeholders = structuredClone(originalPlaceholders)   // Reset placeholders if not snippets

                        if (typeof d === 'string') {
                                switch (d) {
                                        case 'raw':
                                                return cuts.join('')   // Original template with placeholders
                                        case 'demo':
                                                if (!handshake) return `Error: No handshake data.`
                                                d = handshake   // Render with handshake object
                                                break
                                        case 'handshake':
                                                if (!handshake) return `Error: No handshake data.`
                                                return structuredClone(handshake)   // return a copy of handshake object
                                        case 'helpers':
                                                return Object.keys(helpers).join(', ')
                                        case 'placeholders':
                                                return placeholders.map(h => cuts[h.index]).join(', ')
                                        case 'count':
                                                return placeholders.length
                                        default:
                                                return `Error: Wrong instruction "${d}". Available instructions: raw, demo, handshake, helpers, placeholders, count.`
                                }
                        } // if d is string

                        const endData = [];
                        const memory = {};

                        let topLevelType = _defineDataType(d);
                        let deps = { ...buildDependencies, ...dependencies }
                        d = walk({ data: d })  // Creates copy of data to avoid mutation of the original
                        let original = walk({ data: d })  // Creates copy of data to avoid mutation of the original

                        // useHelper definition for build.js
                        const useHelper = (targetName, targetData) => {
                                // If targetData provided, user that. If not, we can't easily know "current" data here outside loop.
                                // But each call site passes 'theData'.
                                // So useHelper actually needs to be a factory or passed with current data.
                                // Wait, in build.js we are iterating.
                                // We can define a generic useHelper here that takes (targetName, targetData).
                                // But if targetData is missing, it should default to the caller's data. 
                                // The caller is the helper function. 
                                // See implementation plan: "Implementation plan: useHelper(name, override). if override missing -> current data."
                                // In build.js loop:
                                // const paramUseHelper = (tName, tData) => render(tData || theData, tName, helpers, original, deps)
                                // We must define this INSIDE the loop or pass 'theData' to a factory.
                                // It's cleaner to define a factory here if possible, but 'theData' changes.
                                // So we will define a createUseHelper function here.
                        }
                        const createUseHelper = (currentData) => (targetName, targetData) => {
                                let
                                        targetFn = helpers[targetName]
                                        , isCompiledTemplate = targetFn && typeof targetFn === 'function' && targetFn.length >= 2 // success(command, d) has > 1 params
                                        ;

                                if (!targetFn) return `{{ Error: Helper '${targetName}' is not available}}`

                                if (isCompiledTemplate) {
                                        // It's likely a compiled template (success function)
                                        // Try calling it with 'render' command
                                        try {
                                                return targetFn('render', targetData || currentData, dependencies)
                                        }
                                        catch (e) {
                                                // Fallback if it wasn't a compiled template but just a function with arguments
                                                return render(targetData || currentData, targetName, helpers, original, deps, ...args)
                                        }
                                }
                                return render(targetData || currentData, targetName, helpers, original, deps, ...args)
                        }
                        if (topLevelType === 'null') return cuts.join('')
                        if (topLevelType !== 'array') d = [d]

                        // Handle null data case - just return the template without placeholders
                        if (topLevelType === 'null') return cuts.join('')

                        d.forEach(dElement => {
                                placeholders.forEach(holder => {   // Placeholders
                                        const
                                                { index, data, action } = holder   // index - placeholder index, data - key of data, action - list of operations
                                                , dataOnly = !action
                                                , mem = structuredClone(memory)
                                                // We cannot define extendArguments here with useHelper because we don't have 'theData' yet.
                                                // It varies per dElement and deeper levels.
                                                // Wait, 'info' is the data for this placeholder sort of.
                                                // But 'extendArguments' is passed to helper.
                                                // We need to inject 'useHelper' at the call site or update extendArguments inside the loops.
                                                , extendArguments = { dependencies: deps, memory: mem }
                                                ;
                                        let info = dElement;

                                        if (data && data.includes('/')) {
                                                if (info.hasOwnProperty(data)) {
                                                        info = info[data]
                                                }
                                                else {
                                                        data.split('/').forEach(d => {
                                                                if (info.hasOwnProperty(d)) info = info[d]
                                                                else info = []
                                                        })
                                                }
                                        } // If data contains '/'
                                        else if (data === '@all' || data === null || data === '@root') info = dElement
                                        else if (data) info = info[data]



                                        if (dataOnly) {
                                                const type = _defineDataType(info);
                                                switch (type) {
                                                        case 'function':
                                                                cuts[index] = info()
                                                                return
                                                        case 'primitive':
                                                                cuts[index] = info
                                                                return
                                                        case 'array':
                                                                if (_defineDataType(info[0]) === 'primitive') cuts[index] = info[0]
                                                                return
                                                        case 'object':
                                                                if (info.text) cuts[index] = info.text
                                                                return
                                                } // switch
                                        } // dataOnly
                                        else {   // Data and Actions or only Actions
                                                let
                                                        { dataDeepLevel, nestedData } = _defineData(info, action)
                                                        , actSetup = _actionSupply(_setupActions(action, dataDeepLevel), dataDeepLevel)
                                                        ;

                                                for (let step of actSetup) {
                                                        let
                                                                { type, name, level } = step
                                                                , levelData = nestedData[level] || []
                                                                ;

                                                        levelData.forEach((theData, iData) => {

                                                                let dataType = _defineDataType(theData)

                                                                switch (type) {   // Action type 'route','data', 'render', or mix -> different operations
                                                                        case 'route':   // DEPRICATED in version 3.2.0. This functionality can be replaced with normal render functions
                                                                                switch (dataType) {
                                                                                        case 'array':
                                                                                                theData.forEach((d, i) => {
                                                                                                        if (d == null) return
                                                                                                        const dType = _defineDataType(d)
                                                                                                        const useHelper = createUseHelper(d);
                                                                                                        const routeName = helpers[name]({ data: d, ...extendArguments, full: d, useHelper });
                                                                                                        if (routeName == null) return
                                                                                                        if (dType === 'object') theData[i]['text'] = render(d, routeName, helpers, original, deps)
                                                                                                        else theData[i] = render(d, routeName, helpers, original, deps)
                                                                                                })
                                                                                                break
                                                                                        case 'object':
                                                                                                theData['text'] = render(theData, name, helpers, original, deps)
                                                                                                break
                                                                                }
                                                                                break
                                                                        case 'save':
                                                                                memory[name] = structuredClone(theData)
                                                                                break
                                                                        case 'overwrite':
                                                                                dElement = structuredClone(theData)
                                                                                break
                                                                        case 'data':
                                                                                switch (dataType) {
                                                                                        case 'array':
                                                                                                theData.forEach((d, i) => {
                                                                                                        const useHelper = createUseHelper(d);
                                                                                                        theData[i] = (d instanceof Function) ? helpers[name]({ data: d(), ...extendArguments, full: d, useHelper }) : helpers[name]({ data: d, ...extendArguments, full: d, useHelper })
                                                                                                })
                                                                                                break
                                                                                        case 'object':
                                                                                                const uhObj = createUseHelper(theData);
                                                                                                nestedData[level] = [helpers[name]({ data: theData, ...extendArguments, full: d, useHelper: uhObj })]
                                                                                                break
                                                                                        case 'function':
                                                                                                const fnData = theData();
                                                                                                const uhFn = createUseHelper(fnData);
                                                                                                nestedData[level] = [helpers[name]({ data: fnData, ...extendArguments, full: d, useHelper: uhFn })]
                                                                                                break
                                                                                        case 'primitive':
                                                                                                const uhPrim = createUseHelper(theData);
                                                                                                nestedData[level] = helpers[name]({ data: theData, ...extendArguments, full: d, useHelper: uhPrim })
                                                                                                break
                                                                                } // switch dataType

                                                                                break
                                                                        case 'render':
                                                                                const isRenderFunction = typeof helpers[name] === 'function';   // Render could be a function and template.
                                                                                switch (dataType) {
                                                                                        case 'array':
                                                                                                if (isRenderFunction) theData.forEach((d, i) => {
                                                                                                        if (d == null) return
                                                                                                        const dType = _defineDataType(d);
                                                                                                        const useHelper = createUseHelper(d);
                                                                                                        const text = helpers[name]({ data: d, ...extendArguments, full: original, useHelper });

                                                                                                        if (text == null) theData[i] = null
                                                                                                        if (dType === 'object') d['text'] = text
                                                                                                        else theData[i] = text
                                                                                                })
                                                                                                else theData.forEach((d, i) => {
                                                                                                        if (d == null) return
                                                                                                        const
                                                                                                                dType = _defineDataType(d)
                                                                                                                , text = render(d, name, helpers, original, deps)
                                                                                                                ;
                                                                                                        if (text == null) theData[i] = null
                                                                                                        else if (dType === 'object') d['text'] = text
                                                                                                        else theData[i] = text
                                                                                                })
                                                                                                break
                                                                                        case 'function':
                                                                                                const fD = theData();
                                                                                                const useHelperFn = createUseHelper(fD);
                                                                                                nestedData[level] = helpers[name]({ data: fD, ...extendArguments, full: d, useHelper: useHelperFn })
                                                                                                break
                                                                                        case 'primitive':
                                                                                                if (isRenderFunction) {
                                                                                                        const uhPrim = createUseHelper(theData);
                                                                                                        nestedData[level] = helpers[name]({ data: theData, ...extendArguments, full: d, useHelper: uhPrim })
                                                                                                }
                                                                                                else nestedData[level] = render(theData, name, helpers, original, deps)
                                                                                                break
                                                                                        case 'object':
                                                                                                if (isRenderFunction) {
                                                                                                        const uhO = createUseHelper(theData);
                                                                                                        nestedData[level][iData]['text'] = helpers[name]({ data: theData, ...extendArguments, full: d, useHelper: uhO })
                                                                                                }
                                                                                                else {
                                                                                                        theData['text'] = render(theData, name, helpers, original, deps)
                                                                                                }
                                                                                                break
                                                                                } // switch renderDataType 
                                                                                break;
                                                                        case 'extendedRender':
                                                                                // TODO: Test extendedRender
                                                                                const isValid = typeof helpers[name] === 'function';   // Render could be
                                                                                if (isValid) {
                                                                                        nestedData[0].forEach((d, i) => {
                                                                                                const uh = createUseHelper(d);
                                                                                                nestedData[0][i] = helpers[name]({ data: d, ...extendArguments, full: d, useHelper: uh })
                                                                                        })
                                                                                }
                                                                                else {
                                                                                        // TODO: Error...
                                                                                }
                                                                                break
                                                                        case 'mix':
                                                                                if (name === '') {   // when is anonymous mixing action
                                                                                        switch (dataType) {
                                                                                                case 'object':
                                                                                                        let kTest = Object.keys(theData).find(k => k.includes('/'));   // Check if keys are breadcrumbs
                                                                                                        if (kTest) Object.entries(theData).forEach(([k, v]) => nestedData[level][k] = v['text'])
                                                                                                        else nestedData[level] = theData['text']
                                                                                                        for (let i = level - 1; i >= 0; i--) {
                                                                                                                nestedData[i] = walk({ data: nestedData[i], objectCallback: check })
                                                                                                        }
                                                                                                        function check({ value, breadcrumbs }) {
                                                                                                                if (nestedData[level][breadcrumbs]) return nestedData[level][breadcrumbs]
                                                                                                                return value
                                                                                                        } // check
                                                                                                        break
                                                                                                case 'array':
                                                                                                        theData.forEach((x, i) => {
                                                                                                                if (i > 0) {
                                                                                                                        let xType = _defineDataType(x);
                                                                                                                        if (x == null) return
                                                                                                                        if (xType === 'object') theData[0] += `${x.text}`
                                                                                                                        else theData[0] += `${x}`
                                                                                                                        theData.toSpliced(i, 1)
                                                                                                                }
                                                                                                                else {
                                                                                                                        let xxType = _defineDataType(x);
                                                                                                                        theData[0] = ''
                                                                                                                        if (xxType === null) return
                                                                                                                        else if (xxType === 'object') theData[0] = `${x.text}`
                                                                                                                        else theData[0] = `${x}`
                                                                                                                }
                                                                                                        })
                                                                                                        theData.length = 1
                                                                                                        break
                                                                                        } // switch dataType
                                                                                } // if name === ''
                                                                                else {
                                                                                        const dType = _defineDataType(d);
                                                                                        const useHelper = createUseHelper(d);
                                                                                        let val = helpers[name]({ data: theData, ...extendArguments, full: d, useHelper });
                                                                                        let valType = _defineDataType(val)
                                                                                                ;

                                                                                        theData.forEach((x, i) => theData.splice(i, 1))
                                                                                        theData.length = 0
                                                                                        switch (valType) {
                                                                                                case 'primitive':
                                                                                                        theData[0] = val
                                                                                                        break
                                                                                                case 'array':
                                                                                                        theData.push(...val)
                                                                                                        break
                                                                                        } // switch valType
                                                                                }
                                                                                break
                                                                        default:
                                                                                break
                                                                }
                                                        }) // levelData
                                                } // for step of actSetup

                                                if (nestedData instanceof Array &&
                                                        nestedData.length === 1 &&
                                                        nestedData[0] instanceof Array
                                                ) nestedData = nestedData[0]
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
                                                } // switch accType
                                        } // else other                
                                }) // forEach placeholders

                                if (onlySnippets) endData.push(placeholders.map(x => cuts[x.index]).join('<~>'))
                                else endData.push(cuts.join(''))
                        }) // forEach d

                        if (topLevelType === 'array') return endData
                        // Execute postprocess functions
                        if (args) return args.reduce((acc, fn) => {
                                if (typeof fn !== 'function') return acc
                                return fn(acc, deps)
                        }, endData.join(''))
                        else return endData.join('')
                } // success func.
                return extra ? [true, success] : success
        } // if no error
} // build func.



export default build


