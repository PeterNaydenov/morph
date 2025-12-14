import _defineDataType from "./_defineType.js"

function actionExtendedRender({ name }, levelData, { helpers, extendArguments, nestedData, level, useHelper }) {
    // levelData is unused?
    // build.js used `nestedData[0]`.
    // "nestedData[0].forEach((d, i) => {"
    // "const uh = createUseHelper(d);"
    // "nestedData[0][i] = helpers[name]({ data: d, ...extendArguments, full: d, useHelper: uh })"

    // This seems to assume extendedRender operates on ROOT data (nestedData[0])?
    // Yes, `nestedData[0]` is typically the initial data list.

    const isValid = typeof helpers[name] === 'function';

    if (isValid) {
        if (nestedData[0] && Array.isArray(nestedData[0])) {
            nestedData[0].forEach((d, i) => {
                const uh = useHelper(d);
                nestedData[0][i] = helpers[name]({ data: d, ...extendArguments, full: d, useHelper: uh })
            })
        }
    }
    else {
        // TODO: Error...
    }
}

export default actionExtendedRender
