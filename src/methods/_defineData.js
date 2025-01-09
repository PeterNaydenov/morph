import walk from '@peter.naydenov/walk'



function _defineData ( d, action ) {
    const nestedData = {};
    let dataDeepLevel = 0;

    if ( d instanceof Function )   return {  dataDeepLevel:0, nestedData:[d()] }
    if ( d == null             )   return {  dataDeepLevel:0, nestedData:[ null ] }
    if ( typeof d === 'string' )   return {  dataDeepLevel:0, nestedData:[d] }

    // Note: Nest data only if action includes '#'
    if ( !action.includes('#') ) {
            return { dataDeepLevel:0, nestedData:[d] }
        }
    
           function findObjects ({key, value, breadcrumbs}) {
                    let isArray = false;

                    dataDeepLevel = breadcrumbs.split('/').length -1;
                    if ( !isNaN(key) )  isArray = true
                    if ( !nestedData[dataDeepLevel] )   nestedData[dataDeepLevel] = isArray? [] : {}
                    if ( key === 'root' ) nestedData[dataDeepLevel] = value
                    else if ( isArray )   nestedData[dataDeepLevel].push ( value )
                    else                  nestedData[dataDeepLevel][breadcrumbs] = value
                    return value
            } // step func.

    walk ({ data:d, objectCallback:findObjects })
    return { dataDeepLevel, nestedData }
} // _defineData func.



export default _defineData


