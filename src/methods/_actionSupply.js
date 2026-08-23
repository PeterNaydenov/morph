/**
 * Factory for the action-supply generator. Receives the stack library through
 * the dependency object - this module performs no imports.
 *
 * @param {object} deps
 * @param {Function} deps.stack - @peter.naydenov/stack factory
 * @returns {Function} The _actionSupply generator function
 */
function _actionSupplyFactory ({ stack }) {



/**
 * Generator function that supplies actions in a controlled sequence using a stack.
 * 
 * Manages the flow of actions through different processing levels, allowing for
 * dynamic action insertion during processing.
 * 
 * @param {Object} act - Object containing action arrays organized by level
 * @param {number} level - Maximum processing level
 * @returns {Generator} Generator that yields action objects in sequence
 * 
 * @example
 * const generator = _actionSupply(actionSetup, 2);
 * for (const action of generator) {
 *   // Process each action
 * }
 */
function* _actionSupply ( act, level ) {
    let action = stack ({ type:'LIFO' });
    for ( let i=0; i<=level; i++ ) {
                    action.push ( act[i] )          
            }
    while ( action && !action.isEmpty () ) {
                    let newAct = yield action.pull ()
                    if ( newAct )  action.push ( newAct )
            }
    } // _actionSupply func.


return _actionSupply
} // _actionSupplyFactory func.

export default _actionSupplyFactory
