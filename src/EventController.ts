
import { HashiController } from "./solver/HashiController";
import { CanvasDrawer } from "./ui/CanvasDrawer";


    var bodyElement:HTMLBodyElement = document.getElementById("body") as HTMLBodyElement;

    var autoImport:HTMLInputElement = document.getElementById("autoImport") as HTMLInputElement;
    let autoImportFlg:boolean =  autoImport.checked;
    var tempUrlIn:string = "";
    var tempUrlOut:string = "";
    var importButton:HTMLButtonElement = document.getElementById("importButton") as HTMLButtonElement;

    var autoSolve:HTMLInputElement = document.getElementById("autoSolve") as HTMLInputElement;
    let autoSolveFlg:boolean =  autoSolve.checked;
    var solveButton:HTMLButtonElement = document.getElementById("solveButton") as HTMLButtonElement;

    var urlElement:HTMLInputElement = document.getElementById("url") as HTMLInputElement;
    var solveDepthElement:HTMLInputElement = document.getElementById("solveDepth") as HTMLInputElement

    
    var hashiCntl:HashiController = new HashiController();
    var drawer = new CanvasDrawer();

    bodyElement.onload = function initialDisplay(){
        autoImport.checked = true;
        autoImportFlg = true;
        importButton.style.visibility="hidden"
        autoSolve.checked = true;
        autoSolveFlg = true;
        solveButton.style.visibility="hidden"
    }

    autoImport.onchange = function changeAutoImport():void{
        autoImportFlg =   autoImport.checked;
        if(autoImportFlg){
            importButton.style.visibility="hidden"
        }else{
            importButton.style.visibility="visible"
        }
    }

    autoSolve.onchange = function changeAutoSolve():void{
        autoSolveFlg =   autoSolve.checked;
        if(autoSolveFlg){
            solveButton.style.visibility="hidden"
        }else{
            solveButton.style.visibility="visible"
        }
    }

    urlElement.addEventListener('focusin',(ev) => {
        tempUrlIn = urlElement.value;
    });

    urlElement.addEventListener('focusout',(ev) => {
        tempUrlOut = urlElement.value;
        if(tempUrlIn != tempUrlOut && autoImportFlg){
            importUrl();
        }
    });

    //urlElement.onchange = function importUrlIfAuto():void{
    //    if(autoImportFlg){
    //        importUrl();
    //    }
    //}

    importButton.onclick = function (){
        importUrl();
    }

    function importUrl():void{
        let url:string = urlElement.value;
        //url文字列チェックに引っ掛かったら中断
        if(!checkUrl(url)){
            return
        }
        hashiCntl = new HashiController(url);
        drawer.clearAll();
        drawer = new CanvasDrawer();
        drawer.drawNums(hashiCntl);


        if(autoSolveFlg){
            solve();
        }
    }

    function checkUrl(url:string):boolean{
        //URLチェックが必要であれば適宜追記する
        if(url.length===0){
            return false;
        }

        return true;
    }

    solveButton.onclick = function(){
        solve();
    }

    function solve():void{
        let depthStr:string = solveDepthElement.value;
        let depth:number;
        if(depthStr.length===0){
            depth = 4;
        }else{
            depth = Number(depthStr);
        }
        hashiCntl.solve(depth);
        drawer.clearLines();
        drawer.drawAllResult(hashiCntl);
    }
