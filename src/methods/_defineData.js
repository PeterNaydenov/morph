import walk from '@peter.naydenov/walk'



function _defineData ( dSource, action ) {
    const nestedData = [];
    let dataDeepLevel = 0;

    if ( dSource instanceof Function )   return {  dataDeepLevel:0, nestedData:[[dSource()]] }
    if ( dSource == null             )   return {  dataDeepLevel:0, nestedData:[ null ] }
    if ( typeof dSource === 'string' )   return {  dataDeepLevel:0, nestedData:[[dSource]] }

    const d = structuredClone ( dSource )
 
    // Note: Nest data only if action has '#'
    if ( !action.includes('#') ) {
            nestedData.push ( [d] )
            return { dataDeepLevel:0, nestedData }
        }
        
    function findObjects ({key, value, breadcrumbs}) {
                    if ( key === breadcrumbs ) {
                            nestedData[0] = [ value ]
                            return value
                       }
                    dataDeepLevel = breadcrumbs.split('/').length-1;
                    if ( !nestedData[dataDeepLevel] )   nestedData[dataDeepLevel] = [];
                    nestedData[dataDeepLevel].push ( value )                     
                    return value
            } // findObjects func.

    walk ({ data:d, objectCallback:findObjects })
    return { dataDeepLevel, nestedData }
} // _defineData func.



export default _defineData


