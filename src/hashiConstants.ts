export class ResultPatterns{
    //0は変化なし
    //1~8は数字手筋
    //Xは数字共通
    //Iは島手筋
    //9は破綻やソルバー設計エラー
    public static resultDict =  new Map([
        ['000','変化なし'],
        ['001','チェック済み'],
        ['002','残り0本'],
        ['010','正常終了'],
        ['020','仮定成功'],
        ['091','未解答（引き残り）'],
        ['092','未解答（孤立）'],
        ['X01','使い切り'],
        ['I00','島の出口限定'],
        ['101','1-壁*3'],
        ['121','1-孤立1*3'],
        ['122','1-壁*1+孤立1*2'],
        ['123','1-壁*2+孤立1*1'],
        ['211','2-0*2+1隣接*1'],
        ['221','2-壁*1+孤立1*2'],
        ['222','2-壁*2+孤立2*1'],
        ['223','2-壁*2+孤立2*2'],
        ['231','2-壁*2+1隣接*1+孤立2*1'],
        ['301','3-壁*2'],
        ['311','3-0*1+1隣接*2'],
        ['321','3-壁*1+孤立1隣接*1+孤立2*1'],
        ['322','3-壁*1+孤立1隣接*1+孤立2*2'],
        ['323','3-孤立1*3'],
        ['331','3-壁*1+孤立1隣接*2+孤立2*1'],
        ['411','4-0*1+1隣接*1'],
        ['412','4-1隣接*3'],
        ['421','4-壁*1+孤立2*2'],
        ['422','4-壁*1+孤立2*3'],
        ['423','4-孤立1*2+孤立2*1'],
        ['424','4-孤立1*2+孤立2*2'],
        ['431','4-1隣接+1+孤立2*2'],
        ['501','5-0*1'],
        ['511','5-1隣接*2'],
        ['521','5-孤立1+孤立2*2'],
        ['522','5-孤立1+孤立2*3'],
        ['531','5-1隣接*1+孤立1隣接*1+孤立2*2'],
        ['532','5-孤立1隣接*2+孤立2*2'],
        ['611','6-1隣接*1'],
        ['621','6-孤立2*3'],
        ['622','6-孤立2*4'],
        ['631','6-1隣接*1+孤立2*3'],
        ['701','7-デフォルト'],
        ['901','破綻（本数不正）'],
        ['902','破綻（孤立）'],
        ['910','合計本数不正'],
        ['999','ソルバーエラー'],
    ]);

}