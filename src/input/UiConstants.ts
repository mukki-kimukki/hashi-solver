export namespace UiConstants{
    export const bgColor:string ="white";
    export const lineColor:string="black";
    export const tryColor:string="gray";
    export const tgtColor:string="red";
    export const tgtFillColor:string="red";
    export const checkColor:string="rgb(30,200,200)";
    export const checkFillColor:string="rgb(30,200,200)";
    export const gridSize:number = 30; //各計算で割り切れるように30の倍数で設定する
    export const DrawType = {
        inputLog:"input",
        solverLog:"solver",
    } as const;
    export type DrawType = typeof DrawType[keyof typeof DrawType]; 
    export const InputType = {
        lines:"lines",
        number:"number",
        url:"url",
        board:"board",
    } as const;
    export type InputType = typeof InputType[keyof typeof InputType]; 
}
