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


import build from "./methods/build.js"



const storage = ( () => ({default: {}}) ) ();






/**
 * Retrieves a template from storage.
 * 
 * @param {string[]} location - The location of the template. Array of two elements:
 *   - First element: The name of the template
 *   - Second element (optional): The name of the storage. Defaults to 'default'
 * 
 * @returns {Function} The template (render function) if found, or an error function that returns
 *   an error message if the storage or template doesn't exist.
 * 
 * @example
 * // Get template from default storage
 * const template = get(['myTemplate']);
 * 
 * @example
 * // Get template from custom storage
 * const template = get(['myTemplate', 'customStorage']);
 */
function get ( location ) {
    if ( !(location instanceof Array) ) {  
                return function () { 
                        return 'Error: Argument "location" is a string. Should be an array. E.g. ["templateName", "storageName"].' 
                    } 
        }
    const [prop, strName='default'] = location;
    if ( !storage[strName] ) {
            return function () {
                  return `Error: Storage "${strName}" does not exist.`
               }
        }
    if ( !storage[strName][prop] ) {
            return function () {
                  return `Error: Template "${prop}" does not exist in storage "${strName}".`
               }
        }
    return storage[strName][prop]
} // get func.







/**
 * Adds a template to storage.
 * 
 * If the template is already a function, it's added directly to storage.
 * If it's a template description object, it's built first and then added.
 * If the template is null or broken, a warning/error is logged and it's not added.
 * 
 * @param {string[]} location - The location to add the template to. Array of two elements:
 *   - First element: The name of the template
 *   - Second element (optional): The name of the storage. Defaults to 'default'
 * @param {object|function|null} tplfn - The template description object, pre-built template function, or null
 * @param {...any} args - Additional arguments passed to the build function (only used when tplfn is a template description)
 * 
 * @example
 * // Add a pre-built template function
 * add(['myTemplate'], templateFunction);
 * 
 * @example
 * // Add and build a template description
 * add(['myTemplate'], {
 *   template: 'Hello {{name}}!',
 *   helpers: { name: (data) => data.data.name }
 * });
 */
function add ( location, tplfn, ...args ) {
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
    let r = storageNames.map ( strName => {
                        if ( !storage[strName] ) return []
                        else                     return Object.keys ( storage[strName])
                }) 
    return r.flat ()
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
 * @param {string[]} location - The location of the template to remove. Array of two elements:
 *   - First element: The name of the template
 *   - Second element (optional): The name of the storage. Defaults to 'default'
 * 
 * @returns {void|string} Returns an error message if the storage or template doesn't exist,
 *   otherwise returns undefined.
 * 
 * @example
 * // Remove template from default storage
 * remove(['myTemplate']);
 * 
 * @example
 * // Remove template from custom storage
 * remove(['myTemplate', 'customStorage']);
 */
function remove ( location ) {
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


