import _defineDataType from "./_defineType.js"
import walk from '@peter.naydenov/walk'

function actionMix({ name }, levelData, { helpers, extendArguments, nestedData, level, useHelper }) {
    const theData = levelData
    let dataType = _defineDataType(theData)

    if (name === '') {   // when is anonymous mixing action
        switch (dataType) {
                    case 'object':
                        let kTest = Object.keys(theData).find(k => k.includes('/'));   // Check if keys are breadcrumbs
                        if (kTest) Object.entries(theData).forEach(([k, v]) => nestedData[level][k] = v['text'])
                        else nestedData[level] = theData['text']
                        for (let i = level - 1; i >= 0; i--) {
                                nestedData[i] = walk({ data: nestedData[i], objectCallback: check })
                            }
                        function check({ value, breadcrumbs }) {
                                if (nestedData[level][breadcrumbs]) return nestedData[level][breadcrumbs]
                                return value
                            } // check func.
                        break
                    case 'array':
                        theData.forEach((x, i) => {
                                if (i > 0) {
                                        let xType = _defineDataType(x);
                                        if (x == null) return
                                        if (xType === 'object') theData[0] += `${x.text}`
                                        else theData[0] += `${x}`
                                        theData.toSpliced(i, 1)
                                    }
                                else {
                                        let xxType = _defineDataType(x);
                                        theData[0] = ''
                                        if (xxType === null) return
                                        else if (xxType === 'object') theData[0] = `${x.text}`
                                        else theData[0] = `${x}`
                                    }
                            }) // forEach theData
                        theData.length = 1
                        break
            } // switch dataType
        } // if name === ''
    else {
                const dType = _defineDataType ( theData ); // 'd' in build.js was 'd' from loop, here 'theData'
                const localUseHelper = useHelper ( theData );
                let val = helpers[name]({ data: theData, ...extendArguments, full: theData, useHelper: localUseHelper }); // 'full: d' in build.js, here 'theData'
                let valType = _defineDataType(val);

                theData.forEach((x, i) => theData.splice(i, 1))
                theData.length = 0
                switch (valType) {
                            case 'primitive':
                                theData[0] = val
                                break
                            case 'array':
                                theData.push(...val)
                                break
                    } // switch valType
        }
} // actionMix func.



export default actionMix


