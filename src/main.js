/***
 *   Morph (@peter.naydenov/morph)
 * 
 *   Text based template engine
 * 
 * 
 *   History notes:
 *   - Idea was born on October 28th, 2024.  
 *   - Published on GitHub for first time: November 30th, 2024
 * 
 */


import build from "./methods/build.js"



const storage = { default: {}};



function get ( prop, strName='default' ) {
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



function add ( name, tplfn, strName='default' ) {
    let fn = tplfn;
    let successBuild = true;
    if( !storage[strName] )   storage[strName] = {}
    if ( typeof tplfn !== 'function' )  [ successBuild, fn ] = build ( tplfn, true )
        
    if ( successBuild )   storage[strName][name] = fn
    else                  console.error ( `Error: Template "${name}" looks broken and is not added to storage.` )
} // add func.



function list ( strName='default' ) {
    if ( !storage[strName] )   return []
    return Object.keys ( storage[strName] )  
} // list func. 



function clear ( ) {
    const keys = Object.keys ( storage )
    keys.forEach ( key => {
              if ( key != 'default' )   delete storage[key]
              else                      storage['default'] = {}
          })
} // clear func.



function remove ( name, strName='default' ) {
    if ( !storage[strName]       )   return `Error: Storage "${strName}" does not exist.`
    if ( !storage[strName][name] )   return `Error: Template "${name}" does not exist in storage "${strName}".`
    delete storage[strName][name]
} // remove func.



const morphAPI = {
                //  Engine API
                /**
                 *  
                 *  build - 
                 *  add - register a component to component storage
                 *  get - get a component from component storage
                 *  list - list all components in component storage
                 *  clear - clear all templates in component storage
                 *  remove - remove a template from component storage
                 *  
                 *  shine - extra step to remove all non used placeholders and <rs> tags
                 * 
                 */
                  build   // build a component from template description
                , get     // get a component from component storage
                , add     // add a component to component storage
                , list    // list all components in component storage
                , clear   // clear all templates in component storage
                , remove  // remove a template from component storage
} // morphAPI

// TODO: How to change render templates on condition?
// - Use compiled versions of simile templates

export default morphAPI


