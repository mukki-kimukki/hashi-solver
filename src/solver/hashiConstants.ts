import {HashiBaseConstants as hbc} from "./HashiBaseConstants";
export namespace HashiConstants{
    export namespace defaultNumLogics {
        export const logic7:[number[],string] = [hbc.default4way.all1,"1701"];
        export const logic0:[number[],string] = [hbc.default4way.all0,"0000"];
        export const result000 = {
            rc00011:[hbc.default4way.all0,hbc.resultCode.rc00011] as [number[],string],
            rc00012:[hbc.default4way.all0,hbc.resultCode.rc00012] as [number[],string],
            rc00013:[hbc.default4way.all0,hbc.resultCode.rc00013] as [number[],string],
            rc00014:[hbc.default4way.all0,hbc.resultCode.rc00014] as [number[],string],
            rc00015:[hbc.default4way.all0,hbc.resultCode.rc00015] as [number[],string],
            rc00016:[hbc.default4way.all0,hbc.resultCode.rc00016] as [number[],string],
            rc00017:[hbc.default4way.all0,hbc.resultCode.rc00017] as [number[],string],
            rc00018:[hbc.default4way.all0,hbc.resultCode.rc00018] as [number[],string],
            rc00019:[hbc.default4way.all0,hbc.resultCode.rc00019] as [number[],string],
            rc000110:[hbc.default4way.all0,hbc.resultCode.rc000110] as [number[],string],
            rc000111:[hbc.default4way.all0,hbc.resultCode.rc000111] as [number[],string],
            rc00021:[hbc.default4way.all0,hbc.resultCode.rc00021] as [number[],string],
            rc00022:[hbc.default4way.all0,hbc.resultCode.rc00022] as [number[],string],
            rc00023:[hbc.default4way.all0,hbc.resultCode.rc00023] as [number[],string],
            rc00024:[hbc.default4way.all0,hbc.resultCode.rc00024] as [number[],string],
            rc00025:[hbc.default4way.all0,hbc.resultCode.rc00025] as [number[],string],
            rc00026:[hbc.default4way.all0,hbc.resultCode.rc00026] as [number[],string],
            rc00027:[hbc.default4way.all0,hbc.resultCode.rc00027] as [number[],string],
            rc00028:[hbc.default4way.all0,hbc.resultCode.rc00028] as [number[],string],
            rc00029:[hbc.default4way.all0,hbc.resultCode.rc00029] as [number[],string],
            rc00031:[hbc.default4way.all0,hbc.resultCode.rc00031] as [number[],string],
            rc00032:[hbc.default4way.all0,hbc.resultCode.rc00032] as [number[],string],
            rc00033:[hbc.default4way.all0,hbc.resultCode.rc00033] as [number[],string],
            rc00034:[hbc.default4way.all0,hbc.resultCode.rc00034] as [number[],string],
            rc00035:[hbc.default4way.all0,hbc.resultCode.rc00035] as [number[],string],
            rc00036:[hbc.default4way.all0,hbc.resultCode.rc00036] as [number[],string],
            rc00041:[hbc.default4way.all0,hbc.resultCode.rc00041] as [number[],string],
            rc00042:[hbc.default4way.all0,hbc.resultCode.rc00042] as [number[],string],
            rc00043:[hbc.default4way.all0,hbc.resultCode.rc00043] as [number[],string],
            rc00044:[hbc.default4way.all0,hbc.resultCode.rc00044] as [number[],string],
            rc00045:[hbc.default4way.all0,hbc.resultCode.rc00045] as [number[],string],
            rc00046:[hbc.default4way.all0,hbc.resultCode.rc00046] as [number[],string],
            rc00051:[hbc.default4way.all0,hbc.resultCode.rc00051] as [number[],string],
            rc00052:[hbc.default4way.all0,hbc.resultCode.rc00052] as [number[],string],
            rc00053:[hbc.default4way.all0,hbc.resultCode.rc00053] as [number[],string],
            rc00061:[hbc.default4way.all0,hbc.resultCode.rc00061] as [number[],string],
        }
    }
    export const defaultNumResults ={
        checked:[[hbc.default4way.all0,"001"],8] as [[number[],string],number],
        remain0:[[hbc.default4way.all0,"002"],0] as [[number[],string],number],
        lack:[[hbc.default4way.all0,"901"],0] as [[number[],string],number],
    }
    /** 
     * 1桁目:0は変化なし、1は確定あり、9は破綻
     * 2桁目:確定内容
     * Xは数字共通
     * Iは島手筋
     * 1~8は数字手筋
     * 3桁目以降は枝番
     * 全桁共通で9は破綻やソルバー設計エラー
     */ 
     export const resultDict =  new Map([
        [hbc.resultCode.rc000,'変化なし'],
        ['001','チェック済み'],
        ['002','残り0本'],
        ['010','正常終了'],
        ['020','仮定成功'],
        ['091','未解答（引き残り）'],
        ['092','未解答（孤立）'],
        ['1I00','島の出口限定'],
        ['1T01','0本仮定'],
        ['1T02','線引き仮定'],
        ['1T031','引き切り行き止まり仮定残り1方向'],
        ['1T032','引き切り行き止まり仮定'],
        ['1M00','最低本数チェイン'],
        ['1C00','塗分け本数'],
        ['1X01','使い切り'],
        ['1101','1-壁*3'],
        ['1121','1-孤立1*3'],
        ['1122','1-壁*1+孤立1*2'],
        ['1123','1-壁*2+孤立1*1'],
        ['1124','1-壁*2+孤立1*1+1引き孤立1*1'],
        ['1211','2-0*2+1隣接*1'],
        ['1221','2-壁*1+孤立1*2'],
        ['1222','2-壁*2+孤立2*1'],
        ['1223','2-壁*2+孤立2*2'],
        ['1231','2-壁*2+1隣接*1+孤立2*1'],
        ['1301','3-壁*2'],
        ['1311','3-0*1+1隣接*2'],
        ['1321','3-壁*1+孤立1隣接*1+孤立2*1'],
        ['1322','3-壁*1+孤立1隣接*1+孤立2*2'],
        ['1323','3-孤立1*3'],
        ['1331','3-壁*1+孤立1隣接*2+孤立2*1'],
        ['1411','4-0*1+1隣接*1'],
        ['1412','4-1隣接*3'],
        ['1421','4-壁*1+孤立2*2'],
        ['1422','4-壁*1+孤立2*3'],
        ['1423','4-孤立1*2+孤立2*1'],
        ['1424','4-孤立1*2+孤立2*2'],
        ['1431','4-1隣接+1+孤立2*2'],
        ['1501','5-0*1'],
        ['1511','5-1隣接*2'],
        ['1521','5-孤立1+孤立2*2'],
        ['1522','5-孤立1+孤立2*3'],
        ['1531','5-1隣接*1+孤立1隣接*1+孤立2*2'],
        ['1532','5-孤立1隣接*2+孤立2*2'],
        ['1611','6-1隣接*1'],
        ['1621','6-孤立2*3'],
        ['1622','6-孤立2*4'],
        ['1631','6-1隣接*1+孤立2*3'],
        ['1701','7-デフォルト'],
        ['901','破綻（本数不正）'],
        ['902','破綻（孤立）-引き未完了'],
        ['903','破綻（孤立）-引き終了'],
        ['912','破綻（孤立）-残り本数1手筋'],
        ['922','破綻（孤立）-残り本数2手筋'],
        ['990','合計本数不正'],
    ]);

}