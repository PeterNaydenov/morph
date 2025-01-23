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
 *   Get a template from a storage.
 * 
 *   @param {string[]} location - The location of the template. Array of two elements.
 *                             The first element is the name of the template. The second element
 *                             is optional and is the name of the storage. Defaults to 'default'.
 * 
 *   @returns {function } The template (a render function) if it exists in the storage.
 *                             An function that returns an error message if 
 *                             either the storage or template does not exist.
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
 *   Add a template to a storage.
 * 
 *   If the template is already a function, it is added to the storage.
 *   If the template is a template description (an object), it is built and
 *   added to the storage.
 *   If the template is broken, an error message is printed in the console
 *   and the template is not added to the storage.
 * 
 *   @param {string[]} location - The location to add the template to. Array of two elements.
 *                             The first element is the name of the template. The second element
 *                             is optional and is the name of the storage. Defaults to 'default'.
 *   @param {object|function|null} tplfn - The template description or the already built template function.
 *   @param {...any} args - Additional arguments to be passed to the build function.
 *                           Only used if the first argument is a template description.
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
 *   Returns an array of all the names of the templates in the given storages.
 *   No arguments - will return the list of templates in the 'default' storage.
 * 
 *   @param {string[]} [storageNames=['default']] - The names of the storages to retrieve template names from;
 *   @returns {string[]} An array of all the template names in the given storages;
 */
function list ( storageNames=['default'] ) {
    let r = storageNames.map ( strName => {
                        if ( !storage[strName] ) return []
                        else                     return Object.keys ( storage[strName])
                }) 
    return r.flat ()
} // list func. 



/**
 * Clears all templates from the storages.
 * This function deletes all storages. Storage 'default' will be reset to an empty object.
 */
function clear ( ) {
    const keys = Object.keys ( storage )
    keys.forEach ( key => {
              if ( key != 'default' )   delete storage[key]
              else                      storage['default'] = {}
          })
} // clear func.




/**
 *   Removes a template from the storage.
 * 
 *   @param {string[]} location - The location to remove the template from. Array of two elements.
 *                             The first element is the name of the template. The second element
 *                             is optional and is the name of the storage. Defaults to 'default'.
 * 
 *   @returns {void|string} An error message if the storage or template does not exist.
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


