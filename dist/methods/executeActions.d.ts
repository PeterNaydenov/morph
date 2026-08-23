/**
 * Factory for the action executor. Receives the action handlers through the
 * dependency object - this module performs no imports.
 *
 * @param {object} deps
 * @param {Function} deps.actionRender - 'render' handler
 * @param {Function} deps.actionData - '>' handler
 * @param {Function} deps.actionMix - '[]' handler
 * @param {Function} deps.actionExtendedRender - '+' handler
 * @param {Function} deps.actionSave - '^name' handler
 * @param {Function} deps.actionOverwrite - '^^' handler
 * @returns {Function} The executeActions function
 */
declare function executeActionsFactory({ actionRender, actionData, actionMix, actionExtendedRender, actionSave, actionOverwrite }: {
    actionRender: Function;
    actionData: Function;
    actionMix: Function;
    actionExtendedRender: Function;
    actionSave: Function;
    actionOverwrite: Function;
}): Function;
export default executeActionsFactory;
