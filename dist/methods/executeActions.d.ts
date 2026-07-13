/**
 * Executes the action chain of a placeholder over the prepared nested data.
 *
 * Actions arrive from the action supplier level by level. Each action type has a
 * dedicated handler that writes its result into `nestedData`. Only 'overwrite'
 * replaces the current data element and hands it back to the caller.
 *
 * @param {object} params - Parameters object
 * @param {array} params.nestedData - Data slices organized by depth level
 * @param {Generator} params.actSetup - Action supplier (see _actionSupply.js)
 * @param {object} params.helpers - Helper functions
 * @param {any} params.original - Original data context
 * @param {object} params.dependencies - Injected dependencies
 * @param {object} params.memory - Internal memory state ('save' action writes here)
 * @param {any} params.dElement - Current top-level data element
 * @param {function} params.createUseHelper - Factory for useHelper functions
 * @returns {any} The (possibly overwritten) data element
 */
declare function executeActions({ nestedData, actSetup, helpers, original, dependencies, memory, dElement, createUseHelper }: {
    nestedData: any[];
    actSetup: Generator;
    helpers: object;
    original: any;
    dependencies: object;
    memory: object;
    dElement: any;
    createUseHelper: Function;
}): any;
export default executeActions;
