
import { HashiController } from "./solver/HashiController";
import { CanvasDrawer } from "./CanvasDrawer";

export class EventController {

    private autoImport:HTMLInputElement;
    private autoImportFlg:boolean;
    private importButton:HTMLButtonElement;
    private autoSolve:HTMLInputElement;
    private autoSolveFlg:boolean;
    private solveButton:HTMLButtonElement;
    private urlElement:HTMLInputElement;
    private solveDepthElement:HTMLInputElement;
    private drawer:CanvasDrawer;
    private hashiCntl:HashiController = new HashiController();


    
    constructor() {
    
        this.autoImport = document.getElementById("autoImport") as HTMLInputElement;
        this.autoImportFlg =  this.autoImport.checked;
        this.importButton = document.getElementById("importButton") as HTMLButtonElement;

        this.autoSolve = document.getElementById("autoSolve") as HTMLInputElement;
        this.autoSolveFlg =  this.autoSolve.checked;
        this.solveButton = document.getElementById("solveButton") as HTMLButtonElement;

        this.urlElement= document.getElementById("url") as HTMLInputElement;
        this.solveDepthElement = document.getElementById("solveDepth") as HTMLInputElement

        this.drawer = new CanvasDrawer();

    }

    public changeAutoImport():void{
        this.autoImportFlg =   this.autoImport.checked;
        if(this.autoImportFlg){
            this.importButton.style.visibility="visible"
        }else{
            this.importButton.style.visibility="hidden"
        }
    }

    public changeAutoSolve():void{
        this.autoSolveFlg =   this.autoSolve.checked;
        if(this.autoSolveFlg){
            this.solveButton.style.visibility="visible"
        }else{
            this.solveButton.style.visibility="hidden"
        }
    }


    public importUrlIfAuto():void{
        if(this.autoImportFlg){
            this.importUrl();
        }
    }

    public importUrl():void{
        let url:string = this.urlElement.getAttribute("url") as string;
        //url文字列チェックに引っ掛かったら中断
        if(!this.checkUrl(url)){
            return
        }
        this.drawer.drawNums(new HashiController(url));


        if(this.autoSolveFlg){
            this.solve();
        }
    }

    private checkUrl(url:string):boolean{
        //URLチェックが必要であれば適宜追記する
        if(url.length===0){
            return false;
        }

        return true;
    }

    private solve():void{
        let depthStr:string = this.solveDepthElement.getAttribute("solveDepth") as string;
        let depth:number;
        if(depthStr.length===0){
            depth = 4;
        }else{
            depth = Number(depthStr);
        }
        this.hashiCntl.solve(depth);
        this.drawer.drawAllResult(this.hashiCntl);
    }

}