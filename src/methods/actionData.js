import _defineDataType from "./_defineType.js"

function actionData({ name }, levelData, { helpers, extendArguments, nestedData, level, useHelper }) {
    const theData = levelData
    let dataType = _defineDataType(theData)

    switch (dataType) {
        case 'array':
            theData.forEach((d, i) => {
                const localUseHelper = useHelper(d);
                theData[i] = (d instanceof Function) ? helpers[name]({ data: d(), ...extendArguments, full: d, useHelper: localUseHelper }) : helpers[name]({ data: d, ...extendArguments, full: d, useHelper: localUseHelper })
            })
            break
        case 'object':
            const uhObj = useHelper(theData);
            nestedData[level] = [helpers[name]({ data: theData, ...extendArguments, full: theData, useHelper: uhObj })]
            break
        case 'function':
            const fnData = theData();
            const uhFn = useHelper(fnData);
            nestedData[level] = [helpers[name]({ data: fnData, ...extendArguments, full: theData, useHelper: uhFn })]
            break
        case 'primitive':
            const uhPrim = useHelper(theData);
            nestedData[level] = helpers[name]({ data: theData, ...extendArguments, full: theData, useHelper: uhPrim })
            break
    } // switch dataType
}

export default actionData
