import walk from '@peter.naydenov/walk'



function _defineData ( d, action ) {
    const nestedData = [];
    let dataDeepLevel = 0;

    if ( d instanceof Function )   return {  dataDeepLevel:0, nestedData:[[d()]] }
    if ( d == null             )   return {  dataDeepLevel:0, nestedData:[ null ] }
    if ( typeof d === 'string' )   return {  dataDeepLevel:0, nestedData:[[d]] }
 
    // Note: Nest data only if action has '#'
    if ( !action.includes('#') ) {
            nestedData.push ( [d] )
            return { dataDeepLevel:0, nestedData }
        }
    
           function findObjects ({key, value, breadcrumbs}) {
                    dataDeepLevel = breadcrumbs.split('/').length -1;

                    if ( !nestedData[dataDeepLevel] )   nestedData[dataDeepLevel] = [];
                    if ( value instanceof Array ) nestedData[dataDeepLevel].push(value)
                    else                          nestedData[dataDeepLevel].push([ value ])                     
                    return value
            } // step func.

    walk ({ data:d, objectCallback:findObjects })
    return { dataDeepLevel, nestedData }
} // _defineData func.



export default _defineData


