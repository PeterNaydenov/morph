declare function actionSave({ name }: {
    name: any;
}, levelData: any, { memory }: {
    memory: any;
}): void;
declare function actionOverwrite({ name }: {
    name: any;
}, levelData: any): any;
export { actionSave, actionOverwrite };
