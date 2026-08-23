/***
 *   Morph (@peter.naydenov/morph)
 *
 *   Text based template engine
 *
 *
 *   History notes:
 *   - Idea was born on October 28th, 2024.
 *   - Published on GitHub for first time: November 30th, 2024
 *   - Version 1.0.0: December 28st, 2024
 *
 */

/**
 * Composition root - THE single place where all imports happen. Every module
 * under ./methods/ is a factory that receives its dependencies through one
 * dependency object; nothing else in the library performs an import. Swap any
 * entry of the `deps` object to mock it - no testing library required.
 */

// External libraries
import stack    from '@peter.naydenov/stack'
import walk     from '@peter.naydenov/walk'

// Pure utilities (no imports inside)
import settings         from './methods/settings.js'
import _chopTemplate    from './methods/_chopTemplates.js'
import _defineDataType  from './methods/_defineType.js'
import { missingHelper } from './methods/_errors.js'
import { actionSave, actionOverwrite } from './methods/actionSave.js'
import _setupActions    from './methods/_setupActions.js'
import actionExtendedRender from './methods/actionExtendedRender.js'

// Factories (receive their dependencies below)
import _escapeFactory               from './methods/_escape.js'
import _actionSupplyFactory         from './methods/_actionSupply.js'
import _defineDataFactory           from './methods/_defineData.js'
import _readTemplateFactory         from './methods/_readTemplate.js'
import _renderHolderFactory         from './methods/_renderHolder.js'
import renderFactory                from './methods/render.js'
import actionDataFactory            from './methods/actionData.js'
import actionMixFactory             from './methods/actionMix.js'
import actionRenderFactory          from './methods/actionRender.js'
import executeActionsFactory        from './methods/executeActions.js'
import processCommandsFactory       from './methods/processCommands.js'
import processPlaceholdersFactory   from './methods/processPlaceholders.js'
import buildFactory                 from './methods/build.js'



// Wiring - dependency order: leaves first, consumers after them
const deps = { settings, stack, walk, _defineDataType, missingHelper, _setupActions }

Object.assign ( deps, _escapeFactory ({ settings }) )                       // escapeHtml, escapeHelper, neutralizeTags, restoreTags

deps._actionSupply      = _actionSupplyFactory ({ stack })
deps._defineData        = _defineDataFactory ({ walk })
deps._chopTemplate      = _chopTemplate                                     // takes settings as its argument
deps._renderHolder      = _renderHolderFactory ({ _chopTemplate: deps._chopTemplate, settings })
deps.render             = renderFactory ({ _renderHolder: deps._renderHolder, missingHelper })
deps.actionData         = actionDataFactory ({ _defineDataType, missingHelper })
deps.actionMix          = actionMixFactory ({ _defineDataType, walk, missingHelper })
deps.actionRender       = actionRenderFactory ({ _defineDataType, render: deps.render })
deps.actionSave         = actionSave
deps.actionOverwrite    = actionOverwrite
deps.actionExtendedRender = actionExtendedRender
deps.executeActions     = executeActionsFactory (deps)

const { handleDebug, handleSet, handleSnippets } = processCommandsFactory ({ escapeHelper: deps.escapeHelper })

deps.processPlaceholders = processPlaceholdersFactory ({
                                  _defineData       : deps._defineData
                                , _defineDataType
                                , _actionSupply     : deps._actionSupply
                                , _setupActions
                                , executeActions    : deps.executeActions
                                , render            : deps.render
                                , escapeHtml        : deps.escapeHtml
                                , neutralizeTags    : deps.neutralizeTags
                                , missingHelper
                            })

const build = buildFactory ({
                                  _readTemplate       : _readTemplateFactory (deps)
                                , _defineDataType
                                , walk
                                , processPlaceholders : deps.processPlaceholders
                                , handleDebug
                                , handleSet
                                , handleSnippets
                            })



/**
 * @typedef {import('./methods/build.js').Template} Template
 * @typedef {import('./methods/build.js').RenderFn} RenderFn
 * @typedef {(() => string) & { isError: true }} MorphErrorFn - Error function returned by get() on a miss. Callable - returns the error message; carries an `isError` marker for detection before rendering.
 */


const storage = { default: {} };



/**
 * The single source of the location-argument contract shared by get(), add()
 * and remove(): a plain string is shorthand for a template in the 'default'
 * storage, an array is [name, storageName?].
 *
 * @param {string|string[]} location - Raw location argument
 * @returns {[string, string]|null} [name, storageName] with 'default' as the
 *   fallback storage, or null when the argument type is invalid.
 */
function normalizeLocation ( location ) {
    const loc = ( typeof location === 'string' )  ?  [ location ]  :  location
    if ( !(loc instanceof Array) )   return null
    const [ name, strName='default' ] = loc
    return [ name, strName ]
} // normalizeLocation func.

const LOCATION_ERROR = `Error: Argument "location" must be a string or an array. E.g. "templateName" or ["templateName", "storageName"].`






/**
 * Retrieves a template from storage.
 *
 * A plain string is accepted as shorthand for a template in the 'default' storage.
 *
 * @param {string|string[]} location - The location of the template. Either:
 *   - A string: the template name in the 'default' storage
 *   - An array of two elements:
 *     - First element: The name of the template
 *     - Second element (optional): The name of the storage. Defaults to 'default'
 *
 * @returns {RenderFn|MorphErrorFn} The template (render function) if found, or an error function carrying an
 *   `isError: true` marker that returns the error message when called. The marker lets callers detect a miss
 *   before rendering: `const tpl = get('x'); if (tpl.isError) ...`
 *
 * @example
 * // Get template from default storage (string shorthand)
 * const template = get('myTemplate');
 *
 * @example
 * // Get template from default storage (array form)
 * const template = get(['myTemplate']);
 *
 * @example
 * // Get template from custom storage
 * const template = get(['myTemplate', 'customStorage']);
 */
function get ( location ) {
    // Error stubs carry an 'isError' marker so callers can detect a miss
    // before rendering. Real templates never have this property.
    const errorFn = message => Object.assign ( () => message, { isError: true })
    const loc = normalizeLocation ( location )
    if ( !loc )   return errorFn ( LOCATION_ERROR )
    const [ prop, strName ] = loc
    if ( !storage[strName] )
            return errorFn ( `Error: Storage "${strName}" does not exist.` )
    if ( !storage[strName][prop] )
            return errorFn ( `Error: Template "${prop}" does not exist in storage "${strName}".` )
    return storage[strName][prop]
} // get func.







/**
 * Adds a template to storage.
 * 
 * If the template is already a function, it's added directly to storage.
 * If it's a template description object, it's built first and then added.
 * If the template is null or broken, a warning/error is logged and it's not added.
 *
 * @param {string|string[]} location - The location to add the template to. Either:
 *   - A string: the template name in the 'default' storage
 *   - An array of two elements:
 *     - First element: The name of the template
 *     - Second element (optional): The name of the storage. Defaults to 'default'
 * @param {Template|RenderFn|null} tplfn - The template description object, pre-built render function, or null
 * @param {...any} args - Additional arguments passed to the build function (only used when tplfn is a template description)
 *
 * @example
 * // Add a pre-built template function (string shorthand)
 * add('myTemplate', templateFunction);
 *
 * @example
 * // Add and build a template description
 * add(['myTemplate'], {
 *   template: 'Hello {{name}}!',
 *   helpers: { name: ({ data }) => data.name }
 * });
 */
function add ( location, tplfn, ...args ) {
    const loc = normalizeLocation ( location )
    if ( !loc ) {
            // Invalid types are reported - a raw value would destructure into
            // wrong name/storage (e.g. 42 would try storage '2' as name '4').
            console.error ( LOCATION_ERROR )
            return
        }
    const [ name, strName ] = loc
    if ( tplfn == null )  {
            console.warn ( `Warning: Template ${strName}/${name} is not added to storage. The template is null.` )
            return
        }
    let fn = tplfn;
    let successBuild = true;
    if( !storage[strName] )   storage[strName] = {}

    if ( typeof tplfn !== 'function' ) { 
                let r = build ( tplfn, true, ...args )
                successBuild = r[0]
                fn = r[1]
        }
    if ( successBuild )   storage[strName][name] = fn
    else                  console.error ( `Error: Template "${name}" looks broken and is not added to storage.` )
} // add func.



/**
 * Returns an array of template names from specified storages.
 * 
 * @param {string[]} [storageNames=['default']] - Array of storage names to retrieve template names from.
 *   Defaults to ['default'] if not provided.
 * 
 * @returns {string[]} Array of all template names from the specified storages.
 * 
 * @example
 * // List templates from default storage
 * const templates = list();
 * 
 * @example
 * // List templates from multiple storages
 * const templates = list(['default', 'customStorage']);
 */
function list ( storageNames=['default'] ) {
    return storageNames.flatMap ( strName => storage[strName]  ?  Object.keys ( storage[strName] )  :  [] )
} // list func.



/**
 * Clears all templates from all storages.
 * 
 * Deletes all custom storages and resets the 'default' storage to an empty object.
 * 
 * @example
 * // Clear all templates
 * clear();
 */
function clear ( ) {
    const keys = Object.keys ( storage )
    keys.forEach ( key => {
              if ( key != 'default' )   delete storage[key]
              else                      storage['default'] = {}
          })
} // clear func.




/**
 * Removes a template from storage.
 *
 * A plain string is accepted as shorthand for a template in the 'default' storage.
 * When the target doesn't exist - wrong argument type, unknown storage or unknown
 * template - a descriptive error message is returned so the caller knows the
 * removal did not happen.
 *
 * @param {string|string[]} location - The location of the template to remove. Either:
 *   - A string: the template name in the 'default' storage
 *   - An array of two elements:
 *     - First element: The name of the template
 *     - Second element (optional): The name of the storage. Defaults to 'default'
 *
 * @returns {void|string} Nothing on successful removal, or an error message
 *   describing why nothing was removed.
 *
 * @example
 * // Remove template from default storage (string shorthand)
 * remove('myTemplate');
 *
 * @example
 * // Remove template from default storage (array form)
 * remove(['myTemplate']);
 *
 * @example
 * // Remove template from custom storage
 * remove(['myTemplate', 'customStorage']);
 */
function remove ( location ) {
    const loc = normalizeLocation ( location )
    if ( !loc )   return LOCATION_ERROR
    const [name, strName] = loc;
    if ( !storage[strName]       )   return `Error: Storage "${strName}" does not exist.`
    if ( !storage[strName][name] )   return `Error: Template "${name}" does not exist in storage "${strName}".`
    delete storage[strName][name]
} // remove func.


//  Engine API
const morphAPI = {
                  build   // build a component from template description
                , get     // get a component from component storage
                , add     // add a component to component storage
                , list    // list all components in component storage
                , clear   // clear all templates in component storage
                , remove  // remove a template from component storage
} // morphAPI



export default morphAPI


