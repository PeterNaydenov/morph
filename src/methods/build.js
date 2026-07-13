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
 * @property {boolean} [escape] - Optional. HTML-escape the output of data-only placeholders. Mark single placeholders with action 'raw' to opt out;
 */

/**
 * @typedef {Array}  tupleResult
 * @property {boolean} 0 - Indicates success (true) or failure (false).
 * @property {function} 1 - The rendering function or an error function.
 */



const COMMANDS = [ 'render', 'debug', 'snippets', 'set', 'curry' ]



/**
 *
 * @param {Template} tpl - template definition;
 * @param {boolean} [extra] - Optional. How to receive the answer - false:as a string(answer) or true: as tuple[success, answer];
 * @param {object} [buildDependencies] - Optional. External dependencies injected;
 * @returns {function|tupleResult} - rendering function
 */
function build ( tpl, extra = false, buildDependencies = {}) {
        const { hasError, placeholders, chop, helpers, handshake, snippets, escape } = _readTemplate ( tpl );

        if ( hasError ) {
                const fail = () => hasError
                return extra ? [ false, fail ] : fail
            }

        /**
         * The rendering core, shared by the commands 'render', 'debug', 'snippets' and 'curry'.
         * The 'curry' render sets 'neutralize' - rendered values can not inject new placeholders.
         */
        function renderPass ( d, dependencies, args, { onlySnippets = false, activePlaceholders = placeholders, neutralize = false } = {} ) {

                // A string instead of data is a debug instruction. Instruction 'demo' continues by rendering the handshake data.
                if ( typeof d === 'string' ) {
                        const result = handleDebug ( d, { handshake, helpers, placeholders : activePlaceholders, cuts : chop })
                        const renderTheDemo = ( d === 'demo' )  &&  ( typeof result === 'object' )
                        if ( !renderTheDemo )   return result
                        d = result
                    }

                const dataType = _defineDataType ( d )
                if ( dataType === 'null' )   return chop.join ( '' )

                const
                      deps = { ...buildDependencies, ...dependencies }
                    , data = walk ({ data: d })   // Deep copy. Rendering should never touch caller's data.
                    , original = walk ({ data })
                    , levelData = ( dataType === 'array' )  ?  data  :  [ data ]
                    ;

                const endData = processPlaceholders ({
                                                  d : levelData
                                                , chop
                                                , placeholders : activePlaceholders
                                                , original
                                                , helpers
                                                , dependencies : deps
                                                , memory : {}
                                                , args
                                                , onlySnippets
                                                , escape
                                                , neutralize
                                        });

                if ( dataType === 'array' )   return endData
                // Extra arguments are post-processing functions: ( result, dependencies ) -> result
                return args.reduce (( acc, fn ) => ( typeof fn === 'function' )  ?  fn ( acc, deps )  :  acc, endData.join ( '' ))
        } // renderPass func.

        /**
         * Rendering function. First argument selects a command,
         * the rest of the arguments depend on the command:
         *   - 'render'      : ( 'render', data, dependencies, ...postprocessFn ) -> string
         *   - 'debug'       : ( 'debug', instruction ) -> template internals
         *   - 'snippets'    : ( 'snippets[: names]', data ) -> selected placeholders joined with '<~>'
         *   - 'set'         : ( 'set', { placeholders, helpers, handshake }) -> new rendering function
         *   - 'curry'       : ( 'curry', partialData ) -> new rendering function
         */
        function success ( command = 'render', d = {}, dependencies = {}, ...args ) {

                const knownCommand = ( typeof command === 'string' )  &&  ( COMMANDS.includes ( command ) || command.startsWith ( 'snippets' ))
                if ( !knownCommand )   return `Error: Wrong command "${command}". Available commands: ${COMMANDS.join ( ', ' )}.`

                // Commands 'set' and 'curry' do not render. They produce a new rendering function.
                if ( command === 'set' )   return handleSet ( d, { helpers, handshake, placeholders, chop, build, buildDependencies, escape })
                if ( command === 'curry' ) {
                        const rendered = renderPass ( d, dependencies, args, { neutralize: true })
                        return build ({ template: rendered, helpers, handshake, escape }, false, buildDependencies )
                    }

                // Command 'snippets' renders only the selected placeholders. 'snippets: a, b' selects, plain 'snippets' takes all.
                const
                      onlySnippets = command.startsWith ( 'snippets' )
                    , activePlaceholders = onlySnippets  ?  ( handleSnippets ( command, snippets ) || placeholders )  :  placeholders
                    ;

                return renderPass ( d, dependencies, args, { onlySnippets, activePlaceholders })
        } // success func.

        // Marker: lets useHelper() recognise a build() output without relying on
        // the function's arity (which collides with user helpers that declare
        // 2+ positional parameters).
        success.__isMorphTemplate = true

        return extra ? [ true, success ] : success
} // build func.



export default build


