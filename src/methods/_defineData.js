import walk from '@peter.naydenov/walk'



function _defineData (d) {
    const
              rootData   = {}
            , nestedData = {}
            ;
    let dataDeepLevel = 0;

            function findRoot ({key, value, breadcrumbs}) {
                    const deepLevel = breadcrumbs.split('/').length -2;
                    if ( deepLevel == 0 )   rootData[key] = value
                    return value
            } // findRoot func.
            
           function findObjects ({key, value, breadcrumbs}) {
                    let isArray = false;
                    dataDeepLevel = breadcrumbs.split('/').length -1;
                    if ( !isNaN(key) )  isArray = true 
                    if ( !nestedData[dataDeepLevel] )   nestedData[dataDeepLevel] = isArray? [] : {}
                    if ( isArray )  nestedData[dataDeepLevel].push ( value )
                    else            nestedData[dataDeepLevel][breadcrumbs] = value
                    return value
            } // step func.

    
    walk ({ data:d, objectCallback:findObjects, keyCallback:findRoot })
    
    nestedData[0] = rootData
    if ( dataDeepLevel == 0 )  return { dataDeepLevel, nestedData: { 0:d } }
    else                       return { dataDeepLevel, nestedData }
} // _defineData func.


export default _defineData


