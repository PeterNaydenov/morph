function actionSave({ name }, levelData, { memory }) {
    memory[name] = structuredClone(levelData)
}

function actionOverwrite({ name }, levelData) {
    return structuredClone(levelData)
}

export { actionSave, actionOverwrite }
