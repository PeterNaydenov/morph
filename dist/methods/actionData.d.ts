/**
 * Action 'data' ('>'). Calls the named helper to transform the data before
 * rendering. The result replaces the level data.
 *
 * Function data provides its value by being called. The uncalled item stays
 * available to the helper as the 'full' argument.
 *
 * @param {object} step - Action step: { name } is the helper name
 * @param {any} theData - Current data item from the level slice
 * @param {object} context - Execution context (see executeActions.js)
 */
declare function actionData({ name }: object, theData: any, { helpers, extendArguments, nestedData, level, useHelper }: object): void;
export default actionData;
