import stack from "@peter.naydenov/stack"



function* _actionSupply ( act, level ) {
    let action = stack ({ type:'LIFO' });
    for ( let i=0; i<=level; i++ ) {
                    action.push ( act[i] )          
            }
    while ( action && !action.isEmpty () ) {
                    yield action.pull ()
            }                        
} // _actionSupply func.


export default _actionSupply


