/**
 * Factory for the 'render' action handler. Receives its dependencies through
 * the dependency object - this module performs no imports.
 *
 * @param {object} deps
 * @param {Function} deps._defineDataType - Data type classifier
 * @param {Function} deps.render - Helper/template renderer
 * @returns {Function} The actionRender function
 */
declare function actionRenderFactory({ _defineDataType, render }: {
    _defineDataType: Function;
    render: Function;
}): Function;
export default actionRenderFactory;
