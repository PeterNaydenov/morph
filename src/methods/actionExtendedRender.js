/**
 * Action 'extendedRender' ('+'). Runs the named helper over every item of the
 * root level data (nestedData[0]) and replaces the items with the results.
 *
 * Useful when a placeholder needs to post-process the whole data list after
 * the deeper levels are already rendered. Missing helpers are silently ignored.
 *
 * @param {object} step - Action step: { name } is the helper name
 * @param {any} theData - Current data item (unused - this action works on the root level)
 * @param {object} context - Execution context (see executeActions.js)
 */
function actionExtendedRender ({ name }, theData, { helpers, extendArguments, useHelper, nestedData }) {
    const helper = helpers[name]

    if ( typeof helper !== 'function' )      return
    if ( !Array.isArray ( nestedData[0] ))   return

    nestedData[0].forEach ( ( d, i ) => {
            nestedData[0][i] = helper ({ data: d, ...extendArguments, full: d, useHelper: useHelper ( d ) })
        })
} // actionExtendedRender func.



export default actionExtendedRender


