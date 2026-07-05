    /**
     * 左、上、右、下の順に4方向の数字を格納する
     */
    export type N4way  = FixedLengthArray<number,number,number,number> ;
    /**
     * 各方向に線を引く本数と結果コードのタプル
     */
    export type DefResult = [N4way,string];
    /**
     * 各方向に線を引く本数と結果コードのタプルに加え、線引き後の残り本数を返す数字手筋用の結果タプル
     */
    export type NumResult = [DefResult, number];

    export type Address = {
        x:number,
        y:number,
    };

    export function isAddress(arg: any): arg is Address {
        return arg.x !== undefined;
    }
    export type AddrNumSet = [Address,number];

    
    export const DrawType = {
        input:"input",
        solver:"solver",
    } as const;
    export type DrawType = typeof DrawType[keyof typeof DrawType]; 
    export const DrawColorType = {
        normal:"normal",
        trial:"trial",
        highlight:"highlight",
    } as const;
    export type DrawColorType = typeof DrawColorType[keyof typeof DrawColorType]; 
    export const InputType = {
        lines:"lines",
        number:"number",
        url:"url",
        board:"board",
    } as const;
    export type InputType = typeof InputType[keyof typeof InputType]; 
