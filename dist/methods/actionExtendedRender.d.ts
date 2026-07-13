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
declare function actionExtendedRender({ name }: object, theData: any, { helpers, extendArguments, useHelper, nestedData }: object): void;
export default actionExtendedRender;
