
import { HashiController } from "./solver/HashiController";
import { CanvasDrawer } from "./ui/CanvasDrawer";


    var bodyElement:HTMLBodyElement = document.getElementById("body") as HTMLBodyElement;

    var autoImport:HTMLInputElement = document.getElementById("autoImport") as HTMLInputElement;
    let autoImportFlg:boolean =  autoImport.checked;
    var tempUrlIn:string = "";
    var tempUrlOut:string = "";
    var tempDepthIn:string = "";
    var tempDepthOut:string = "";
    var importButton:HTMLButtonElement = document.getElementById("importButton") as HTMLButtonElement;

    var autoSolve:HTMLInputElement = document.getElementById("autoSolve") as HTMLInputElement;
    let autoSolveFlg:boolean =  autoSolve.checked;
    var solveButton:HTMLButtonElement = document.getElementById("solveButton") as HTMLButtonElement;

    var urlElement:HTMLInputElement = document.getElementById("url") as HTMLInputElement;
    var solveDepthElement:HTMLInputElement = document.getElementById("solveDepth") as HTMLInputElement

    
    var stepListElement:HTMLElement = document.getElementById("stepList") as HTMLElement;
    var currentTargetLi:HTMLElement;
    var currentTargetStepId:number = -1;
    var maxStepId:number=0;
    
    var hashiCntl:HashiController = new HashiController();
    var solvedFlg:boolean =false;
    var gridSize:number = 30;
    var drawer = new CanvasDrawer(gridSize);

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

    urlElement.addEventListener('keypress',(keyEvent)=>{
        if(keyEvent.key==="Enter"){
            solveDepthElement.focus();
        }
    });

    
    solveDepthElement.addEventListener('focusin',(ev) => {
        tempDepthIn = solveDepthElement.value;
    });

    solveDepthElement.addEventListener('focusout',(ev) => {
        tempDepthOut = solveDepthElement.value;
        if(tempDepthIn != tempDepthOut && autoImportFlg){
            importUrl();
        }
    });

    solveDepthElement.addEventListener('keypress',(keyEvent)=>{
        if(keyEvent.key==="enter"){
            stepListElement.focus();
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
        solvedFlg = false;
        hashiCntl = new HashiController(url);
        drawer.clearAll();
        drawer = new CanvasDrawer(gridSize);
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
        solvedFlg=true;
        drawer.clearLines();
        drawer.drawAllResult(hashiCntl);
        displayStepList();
    }

    function displayStepList():void{
        while(stepListElement.firstChild !== null){
            stepListElement.removeChild(stepListElement.firstChild);
        }
        stepListElement.style.height=String(gridSize*hashiCntl.getBoardSize()[0]+"px");
        currentTargetStepId = -1;
        maxStepId = hashiCntl.getResultLog().length -1;
        let stepLength:number = String(maxStepId).length;
        hashiCntl.getResultLog().forEach((log, i)=>{
            let li:HTMLElement = document.createElement("li");
            li.id="step" + String(i);
            li.addEventListener("click",(ev)=>displayStep(i));
            li.classList.add("step");
            li.appendChild(document.createTextNode(("00000000" + String(i+1)).slice(-stepLength) + ": " +log.getResultCode()));
            stepListElement.appendChild(li);
        });
    }

    function displayStep(step:number):void{
        if(currentTargetLi !==undefined){
            currentTargetLi.classList.remove("targetStep");
        }
        let stepLi:HTMLElement = document.getElementById("step" + String(step)) as HTMLElement;
        stepLi.classList.add("targetStep");
        let positionCount:number = step-5;
        stepListElement.scrollTo(0,positionCount*20);
        drawer.drawSteps(step);
        currentTargetLi = stepLi;
        currentTargetStepId = step;
    }

    document.addEventListener("keydown",(keyEvent)=>{
        if(solvedFlg){
            if(keyEvent.key==="w"){ //↑
                if(currentTargetStepId > 0){
                    displayStep(currentTargetStepId - 1);
                }
                
            }else if(keyEvent.key==="s"){ //↓
                if(currentTargetStepId === -1){
                    displayStep(0)
                }else if(currentTargetStepId < maxStepId){
                    displayStep(currentTargetStepId + 1);
                }
                
            }
        }
    });
