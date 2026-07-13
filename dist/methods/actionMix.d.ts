/**
 * Action 'mix' ('[]'). Merges the level data into a single value.
 *
 * Anonymous mix ('[]', no helper name):
 *   - array  : joins all items (or their 'text' property) into one string;
 *   - object : publishes the 'text' results to the upper data levels,
 *              matching values by their breadcrumb keys.
 *
 * Named mix ('[]helperName'): the helper receives the data and produces
 * the merged value itself.
 *
 * @param {object} step - Action step: { name } is the helper name ('' for anonymous mix)
 * @param {any} theData - Current data item from the level slice
 * @param {object} context - Execution context (see executeActions.js)
 */
declare function actionMix({ name }: object, theData: any, { helpers, extendArguments, nestedData, level, useHelper }: object): void;
export default actionMix;
