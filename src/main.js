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
 * @typedef {import('./methods/build.js').Template} Template
 * @typedef {import('./methods/build.js').RenderFn} RenderFn
 * @typedef {(() => string) & { isError: true }} MorphErrorFn - Error function returned by get() on a miss. Callable - returns the error message; carries an `isError` marker for detection before rendering.
 */


import build from "./methods/build.js"



const storage = { default: {} };






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
    if ( typeof location === 'string' )   location = [ location ]
    if ( !(location instanceof Array) ) {
                return errorFn ( `Error: Argument "location" must be a string or an array. E.g. "templateName" or ["templateName", "storageName"].` )
        }
    const [prop, strName='default'] = location;
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
    if ( typeof location === 'string' )   location = [ location ]
    if ( !(location instanceof Array) ) {
            // Mirror get()'s validation. Without this, destructuring a string
            // would silently store the template under a wrong name/storage
            // (e.g. add(42, ...) would try storage '2' as name '4').
            console.error ( `Error: Argument "location" must be a string or an array. E.g. "templateName" or ["templateName", "storageName"].` )
            return
        }
    const [ name, strName='default'] = location
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
    if ( typeof location === 'string' )   location = [ location ]
    if ( !(location instanceof Array) )
            return `Error: Argument "location" must be a string or an array. E.g. "templateName" or ["templateName", "storageName"].`
    const [name, strName='default'] = location;
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


