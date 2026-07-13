/**
 * Action 'render'. Renders the current data item with the named helper and
 * writes the result back into the data slice.
 *
 * Write-back rules:
 *   - primitive results replace the data item;
 *   - object data receives the result as its 'text' property;
 *   - a null result marks the item as null, so later steps can skip it.
 *
 * @param {object} step - Action step: { name } is the helper name
 * @param {any} theData - Current data item from the level slice
 * @param {object} context - Execution context (see executeActions.js)
 */
declare function actionRender({ name }: object, theData: any, { helpers, original, dependencies, useHelper, extendArguments, nestedData, level }: object): void;
export default actionRender;
