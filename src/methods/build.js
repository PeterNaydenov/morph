import _chopTemplate       from "./_chopTemplates.js"
import _readTemplate       from "./_readTemplate.js"
import _defineDataType     from "./_defineType.js"
import walk                from '@peter.naydenov/walk'
import processPlaceholders from './processPlaceholders.js'
import {   
           handleDebug
         , handleSet
         , handleSnippets } from './processCommands.js'


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
function build ( tpl, extra = false, buildDependencies = {}) {
        let { hasError, placeholders, chop, helpers, handshake, snippets } = _readTemplate(tpl);

        if ( hasError ) {
                function fail() { return hasError }
                return extra ? [false, fail] : fail
            }
        else {
                const originalPlaceholders = structuredClone(placeholders);

                function success ( command = 'render', d = {}, dependencies = {}, ...args ) {
                        const cuts = structuredClone(chop)
                        let onlySnippets = false;

                        // Command Validation
                        if (typeof command !== 'string') return `Error: Wrong command "${command}". Available commands: render, debug, snippets, set, curry.`
                        if (!['render', 'debug', 'snippets', 'set', 'curry'].includes(command) && !command.startsWith('snippets')) return `Error: Wrong command "${command}". Available commands: render, debug, snippets, set, curry.`


                        // Handle Commands
                        if (command.startsWith('snippets')) {
                                onlySnippets = true
                                const subset = handleSnippets(command, snippets)
                                if (subset) placeholders = subset
                            }
                        else if (command === 'snippets') {
                                onlySnippets = true
                            }
                        else if (command === 'set') {
                                return handleSet(d, { helpers, handshake, placeholders, chop, build, buildDependencies })
                            }
                        else if (command === 'curry') {
                                // Curry logic
                                const rendered = success ( 'render', d, dependencies, ...args );
                                const newTpl = {
                                        template: rendered,
                                        helpers,
                                        handshake
                                        };
                                return build ( newTpl, false, buildDependencies )
                            }
                        else {
                                placeholders = structuredClone ( originalPlaceholders )
                            }


                        // Handle 'DEBUG' (if d is string and command render/debug?)
                        // Original logic: if (typeof d === 'string').
                        // Wait, success('debug', 'raw') -> command='debug', d='raw'.
                        // success('render', 'demo') -> command='render', d='demo'.
                        // So any string d is treated as instruction ??
                        if (typeof d === 'string') {
                                const res = handleDebug(d, { handshake, helpers, placeholders, cuts })
                                // If handleDebug returns string/number/object, return it.
                                // Unless d='demo' which returns handshake object, then we proceed to render?
                                if (d === 'demo' && typeof res === 'object') d = res
                                else return res
                        }
                        // Proceed to Rendering
                        const memory = {};
                        let topLevelType = _defineDataType(d);
                        let deps = { ...buildDependencies, ...dependencies }

                        d = walk({ data: d })
                        let original = walk({ data: d })

                        if (topLevelType === 'null') return cuts.join('')
                        if (topLevelType !== 'array') d = [d]
                        if (topLevelType === 'null') return cuts.join('') // Redundant check?


                        const endData = processPlaceholders({
                                                          d
                                                        , chop
                                                        , placeholders
                                                        , original
                                                        , helpers
                                                        , dependencies: deps
                                                        , memory
                                                        , args
                                                        , onlySnippets
                                                });


                        if ( topLevelType === 'array' )   return endData

                        // Post-process
                        if (args) {
                                return args.reduce ( ( acc, fn ) => {
                                                        if (typeof fn !== 'function') return acc
                                                        return fn ( acc, deps )
                                                }, endData.join(''))
                        }
                        else return endData.join ( '' )
                } // success func.
                return extra ? [true, success] : success
        }
} // build func.



export default build


