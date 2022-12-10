
import { HashiController } from "./solver/HashiController";
import { CanvasDrawer } from "./input/CanvasDrawer";
import { UiConstants as uc } from "./input/UiConstants";
import { ResultLog } from "./solver/ResultLog";
import { InputLog } from "./input/inputLog";
import { HashiBaseConstants as hbc } from "./solver/HashiBaseConstants";


    const bodyElement:HTMLBodyElement = document.getElementById("body") as HTMLBodyElement;

    const autoImport:HTMLInputElement = document.getElementById("autoImport") as HTMLInputElement;
    let autoImportFlg:boolean =  autoImport.checked;
    let tempUrlIn:string = "";
    let tempUrlOut:string = "";
    let tempDepthIn:string = "";
    let tempDepthOut:string = "";
    const importButton:HTMLButtonElement = document.getElementById("importButton") as HTMLButtonElement;

    const autoSolve:HTMLInputElement = document.getElementById("autoSolve") as HTMLInputElement;
    let autoSolveFlg:boolean =  autoSolve.checked;
    const solveButton:HTMLButtonElement = document.getElementById("solveButton") as HTMLButtonElement;

    const urlElement:HTMLInputElement = document.getElementById("url") as HTMLInputElement;
    const solveDepthElement:HTMLInputElement = document.getElementById("solveDepth") as HTMLInputElement

    let stepElement:HTMLElement = document.getElementById("divStep") as HTMLElement;
    let stepListAtDepth:HTMLElement[] = [];
    let currentTargetLiAtDepth:HTMLElement[];
    let currentTargetStepIdAtDepth:number[] = [-1];
    let currentTargetDepth:number = 0;
    let maxStepIdAtDepth:number[]=[0];
    
    let inputLog:InputLog[]=[];
    let hashiCtrl:HashiController;
    let initialBoard:number[][];
    let solvedFlg:boolean =false;
    let drawer:CanvasDrawer;
    let initFlg:boolean = false;

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

    urlElement.addEventListener('keydown',(keyEvent)=>{
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

    solveDepthElement.addEventListener('keydown',(keyEvent)=>{
        if(keyEvent.key==="enter"){
            urlElement.focus();
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
        const url:string = urlElement.value;
        //url文字列チェックに引っ掛かったら中断
        if(!checkUrl(url)){
            return
        }
        solvedFlg = false;
        if(initFlg){
            inputLog.splice(0);
            drawer.clearAll();
        }
        hashiCtrl = new HashiController(url);
        initialBoard = hashiCtrl.getBoardAbst();
        inputLog.push(new InputLog([],[],url,hbc.resultCode.rcI00));
        drawer = new CanvasDrawer(hashiCtrl);
        initFlg = true;


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
        const depthStr:string = solveDepthElement.value;
        let depth:number;
        if(depthStr.length===0){
            depth = 4;
        }else{
            depth = Number(depthStr);
        }
        hashiCtrl.solve(depth);
        solvedFlg=true;
        drawer.drawAllResult(0,hashiCtrl.getResultLog(),uc.DrawType.solverLog);
        displayStepList(0);
        currentTargetDepth = 0;
    }

    function displayStepList(depth:number):void{
        //描画済みリストを削
        deleteStepList(depth);

        //描画対象リストを作成
        let targetDiv:HTMLElement;
        targetDiv = document.createElement("div");
        targetDiv.classList.add("stepListDiv");
        stepElement.appendChild(targetDiv);
        let targetUl:HTMLElement = document.createElement("ul");
        stepListAtDepth.push(targetUl);
        targetUl.style.paddingTop = String(currentTargetStepIdAtDepth.reduce((prev,cur)=>prev + cur,0) * uc.gridSize) + "px";
        /**
        while(targetStepList.firstChild !== null){
            targetStepList.removeChild(targetStepList.firstChild);
        }
        */
        //targetUl.style.height=String(uc.gridSize*hashiCtrl.getBoardSize()[0]+"px");
        currentTargetStepIdAtDepth[depth] = -1;
        let targetLogList:ResultLog[] = hashiCtrl.getResultLog();
        if(currentTargetDepth > 0){
            for(let i:number = 1; i <= depth; i++){
                targetLogList =  targetLogList[currentTargetStepIdAtDepth[i]].getTryLog();
            }
        }
        maxStepIdAtDepth.push(targetLogList.length -1);
        let stepLength:number = String(maxStepIdAtDepth[depth]).length;
        targetLogList.forEach((log, i)=>{
            const li:HTMLElement = document.createElement("li");
            li.id="depth" + String(depth) + "step" + String(i);
            li.setAttribute("depth",String(depth));
            li.addEventListener("click",(ev)=>displayStep(depth,i,true));
            li.classList.add("step");
            li.appendChild(document.createTextNode(("00000000" + String(i+1)).slice(-stepLength) + ": " +log.getResultCode()));
            targetUl.appendChild(li);
        });
    }

    function deleteStepList(depth:number):void{
        stepListAtDepth.splice(depth).forEach(elm=>{
            stepElement.removeChild(elm.parentNode as ParentNode); 
        });
        currentTargetLiAtDepth.splice(depth);
        currentTargetStepIdAtDepth.splice(depth);
        maxStepIdAtDepth.splice(depth);
    }

    function displayStep(depth:number,step:number,clickFlg:boolean):void{
        if(currentTargetLiAtDepth.length > depth){
            currentTargetLiAtDepth[depth].classList.remove("targetStep");
        }
        const stepLi:HTMLElement = document.getElementById("depth" + String(depth) + "step" + String(step)) as HTMLElement;
        stepLi.classList.add("targetStep");
        const positionCount:number = step-5;
        if(!clickFlg){
            stepListAtDepth[depth].scrollTo(0,positionCount*20);
        }
        drawer.drawSteps(depth,step);
        currentTargetLiAtDepth.push(stepLi);
        currentTargetStepIdAtDepth.push(step);
    }

    document.addEventListener("keydown",(keyEvent)=>{
        if(solvedFlg){
            switch(keyEvent.key){
                case "w": //↑
                    if(currentTargetStepIdAtDepth[currentTargetDepth] > 0){
                        displayStep(currentTargetDepth,currentTargetStepIdAtDepth[currentTargetDepth] - 1,false);
                    }
                    break;
                case "s": //↓
                    if(currentTargetStepIdAtDepth[currentTargetDepth] === -1){
                        displayStep(currentTargetDepth,0,false)
                    }else if(currentTargetStepIdAtDepth[currentTargetDepth] < maxStepIdAtDepth[currentTargetDepth]){
                        displayStep(currentTargetDepth,currentTargetStepIdAtDepth[currentTargetDepth] + 1,false);
                    }
                    break;
                case "a"://←
                    if(currentTargetDepth > 0){
                        deleteStepList(currentTargetDepth);
                        currentTargetDepth -= 1;
                    }
                    break;
                case "d"://→
                    if(true){
                        displayStepList(currentTargetDepth + 1);
                        currentTargetDepth += 1;
                    }
                    break;
            }
        }
    });
