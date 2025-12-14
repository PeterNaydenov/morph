import _defineDataType from "./_defineType.js"
import render from "./render.js"

function actionRender({ name }, levelData, { helpers, original, dependencies, useHelper, extendArguments, nestedData, level, iData }) {
    /**
     * logic from build.js 'render' case
     * levelData is the array we are iterating (nestedData[level] or similar)
     * But wait, build.js iterates levelData.
     * "levelData.forEach((theData, iData) => {"
     * So actionRender receives a SINGLE item?
     * No, existing logic handles 'array' dataType inside the switch.
     * But the loop inside build.js ALREADY iterates levelData.
     * Line 276: `levelData.forEach((theData, iData) => { ... switch(type) ... })`
     * So 'theData' is a single item from the level.
     * BUT 'dataType' switch inside handles 'array'?
     * _defineDataType(theData).
     * If 'theData' is array, it iterates it.
     * Yes.
     */

    const theData = levelData
    let dataType = _defineDataType(theData)
    const isRenderFunction = typeof helpers[name] === 'function';

    switch (dataType) {
        case 'array':
            if (isRenderFunction) {
                theData.forEach((d, i) => {
                    if (d == null) return
                    const dType = _defineDataType(d);
                    // useHelper is specialized for 'd' ??
                    // in build.js: const useHelper = createUseHelper(d);
                    // access to 'createUseHelper' needed?
                    // Yes.
                    // So we pass 'createUseHelper' factory, not the instance?
                    // Or we pass the instance if it was already created?
                    // In build.js loop: "const useHelper = createUseHelper(d);" happens INSIDE case 'route'/'data'/'render' loops usually.
                    // But here we are inside case 'render'.
                    // So we need 'createUseHelper' passed in context.

                    const localUseHelper = useHelper(d)
                    const text = helpers[name]({ data: d, ...extendArguments, full: original, useHelper: localUseHelper });

                    if (text == null) theData[i] = null
                    if (dType === 'object') d['text'] = text
                    else theData[i] = text
                })
            }
            else {
                theData.forEach((d, i) => {
                    if (d == null) return
                    const
                        dType = _defineDataType(d)
                        , text = render(d, name, helpers, original, dependencies)
                        ;
                    if (text == null) theData[i] = null
                    else if (dType === 'object') d['text'] = text
                    else theData[i] = text
                })
            }
            break
        case 'function':
            const fD = theData();
            const useHelperFn = useHelper(fD);
            nestedData[level] = helpers[name]({ data: fD, ...extendArguments, full: theData, useHelper: useHelperFn })
            break
        case 'primitive':
            if (isRenderFunction) {
                const uhPrim = useHelper(theData);
                nestedData[level] = helpers[name]({ data: theData, ...extendArguments, full: theData, useHelper: uhPrim })
            }
            else nestedData[level] = render(theData, name, helpers, original, dependencies)
            break
        case 'object':
            if (isRenderFunction) {
                const uhO = useHelper(theData);
                nestedData[level][iData]['text'] = helpers[name]({ data: theData, ...extendArguments, full: theData, useHelper: uhO })
            }
            else {
                theData['text'] = render(theData, name, helpers, original, dependencies)
            }
            break
    } // switch renderDataType 
}

export default actionRender
