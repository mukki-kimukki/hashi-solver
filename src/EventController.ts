import { HashiController } from "./solver/HashiController";
import { CanvasController } from "./input/CanvasController";
import { ResultLog } from "./solver/ResultLog";
import { InputLog } from "./input/inputLog";
import { HashiBaseConstants as hbc } from "./solver/HashiBaseConstants";
import { InputType } from "./common/Types";

const bodyElement = document.getElementById("body") as HTMLBodyElement;
const autoImport = document.getElementById("autoImport") as HTMLInputElement;
const importButton = document.getElementById("importButton") as HTMLButtonElement;
const autoSolve = document.getElementById("autoSolve") as HTMLInputElement;
const solveButton = document.getElementById("solveButton") as HTMLButtonElement;
const urlElement = document.getElementById("url") as HTMLInputElement;
const solveDepthElement = document.getElementById("solveDepth") as HTMLInputElement;
const stepElement = document.getElementById("divStep") as HTMLElement;

type StepColumnKind = "main" | "parent" | "current";

let autoImportFlg = autoImport.checked;
let autoSolveFlg = autoSolve.checked;
let tempUrlIn = "";
let tempUrlOut = "";
let tempDepthIn = "";
let tempDepthOut = "";

let stepListAtDepth: HTMLElement[] = [];
let currentTargetLiAtDepth: HTMLElement[] = [];
let currentTargetStepIdAtDepth: number[] = [-1];
let currentBranchIndexAtDepth: number[] = [];
let currentTargetDepth = 0;
let maxStepIdAtDepth: number[] = [0];
let logsAtDepth: ResultLog[][] = [];

let inputLog: InputLog[] = [];
let hashiCtrl: HashiController;
let solvedFlg = false;
let drawer: CanvasController;
let initFlg = false;

function initialDisplay(): void {
    autoImport.checked = true;
    autoImportFlg = true;
    importButton.style.visibility = "hidden";
    autoSolve.checked = true;
    autoSolveFlg = true;
    solveButton.style.visibility = "hidden";
}

function changeAutoImport(): void {
    autoImportFlg = autoImport.checked;
    importButton.style.visibility = autoImportFlg ? "hidden" : "visible";
}

function changeAutoSolve(): void {
    autoSolveFlg = autoSolve.checked;
    solveButton.style.visibility = autoSolveFlg ? "hidden" : "visible";
}

function checkUrl(url: string): boolean {
    return url.length > 0;
}

function importUrl(): void {
    const url = urlElement.value;
    if (!checkUrl(url)) {
        return;
    }

    solvedFlg = false;
    if (initFlg) {
        inputLog.splice(0);
        drawer.clearAll();
    }

    hashiCtrl = new HashiController(url);
    inputLog.push(new InputLog(hbc.resultCode.rcI00, InputType.url, url));
    drawer = new CanvasController(hashiCtrl);
    initFlg = true;
    resetStepState();

    if (autoSolveFlg) {
        solve();
    }
}

function solve(): void {
    const depthStr = solveDepthElement.value;
    const depth = depthStr.length === 0 ? 4 : Number(depthStr);
    hashiCtrl.solve(depth);
    solvedFlg = true;
    resetStepState();
    ensureLogsForDepth(0);
    const rootLogs = logsAtDepth[0] ?? [];
    renderVisibleColumns();
    if (rootLogs.length > 0) {
        const lastStep = rootLogs.length - 1;
        displayStep(0, lastStep, false);
    }
}

function resetStepState(): void {
    stepElement.replaceChildren();
    stepListAtDepth = [];
    currentTargetLiAtDepth = [];
    currentTargetStepIdAtDepth = [-1];
    currentBranchIndexAtDepth = [];
    currentTargetDepth = 0;
    maxStepIdAtDepth = [0];
    logsAtDepth = [];
}

function getLogsForDepth(depth: number): ResultLog[] {
    if (depth === 0) {
        return hashiCtrl.getResultLog();
    }

    const parentLogs = logsAtDepth[depth - 1] ?? [];
    const parentStep = currentTargetStepIdAtDepth[depth - 1];
    const parentLog = parentLogs[parentStep];
    if (!parentLog) {
        return [];
    }

    const branchIndex = currentBranchIndexAtDepth[depth] ?? 0;
    return parentLog.getBranches()[branchIndex]?.logs ?? [];
}

function ensureLogsForDepth(depth: number): ResultLog[] {
    if (logsAtDepth[depth]) {
        return logsAtDepth[depth];
    }

    const targetLogs = getLogsForDepth(depth);
    logsAtDepth[depth] = targetLogs;
    maxStepIdAtDepth[depth] = targetLogs.length - 1;
    drawer.setResultLogs(depth, targetLogs);
    return targetLogs;
}

function getVisibleDepths(): number[] {
    if (currentTargetDepth <= 0) {
        return [0];
    }
    if (currentTargetDepth === 1) {
        return [0, 1];
    }
    return [0, currentTargetDepth - 1, currentTargetDepth];
}

function getColumnKind(depth: number): StepColumnKind {
    if (depth === 0) {
        return "main";
    }
    if (depth === currentTargetDepth) {
        return "current";
    }
    return "parent";
}

function getColumnTitle(depth: number, kind: StepColumnKind): string {
    if (kind === "main") {
        return "main";
    }

    const branchIndex = currentBranchIndexAtDepth[depth] ?? 0;
    const parentLog = logsAtDepth[depth - 1]?.[currentTargetStepIdAtDepth[depth - 1]];
    const branch = parentLog?.getBranches()[branchIndex];
    const role = kind === "parent" ? "parent" : "current";
    if (!branch) {
        return role;
    }
    return role + " branch " + String(branchIndex + 1) + ": " + branch.label + " / " + branch.outcome;
}

function renderVisibleColumns(): void {
    stepElement.replaceChildren();
    stepListAtDepth = [];
    currentTargetLiAtDepth = [];

    getVisibleDepths().forEach((depth) => renderStepColumn(depth, getColumnKind(depth)));
}

function renderStepColumn(depth: number, kind: StepColumnKind): void {
    const targetLogs = ensureLogsForDepth(depth);
    const targetDiv = document.createElement("div");
    targetDiv.classList.add("stepListDiv", "stepListDiv-" + kind);
    stepElement.appendChild(targetDiv);

    const targetUl = document.createElement("ul");
    targetUl.classList.add("stepList");
    stepListAtDepth[depth] = targetUl;
    targetDiv.appendChild(targetUl);

    const columnLabel = document.createElement("li");
    columnLabel.classList.add("branchHeader", "branchHeader-" + kind);
    columnLabel.appendChild(document.createTextNode(getColumnTitle(depth, kind)));
    targetUl.appendChild(columnLabel);

    maxStepIdAtDepth[depth] = targetLogs.length - 1;
    const stepLength = String(Math.max(maxStepIdAtDepth[depth] + 1, 1)).length;

    targetLogs.forEach((log, i) => {
        const li = document.createElement("li");
        li.id = "depth" + String(depth) + "step" + String(i);
        li.setAttribute("depth", String(depth));
        li.addEventListener("click", () => displayStep(depth, i, true));
        li.classList.add("step", "step-" + kind);

        if (currentTargetStepIdAtDepth[depth] === i) {
            li.classList.add("targetStep");
            currentTargetLiAtDepth[depth] = li;
        }

        const stepText = document.createElement("span");
        stepText.classList.add("stepText");
        stepText.appendChild(document.createTextNode(("00000000" + String(i + 1)).slice(-stepLength) + ": " + log.getResultCode()));
        li.appendChild(stepText);

        const branches = log.getBranches();
        if (branches.length > 0) {
            const branchControls = document.createElement("span");
            branchControls.classList.add("branchControls");
            branches.forEach((branch, branchIndex) => {
                const button = document.createElement("button");
                button.type = "button";
                button.classList.add("branchButton", "branchButton-" + branch.outcome);
                button.title = branch.label + " / " + branch.outcome;
                button.appendChild(document.createTextNode(String(branchIndex + 1)));
                button.addEventListener("click", (ev) => {
                    ev.stopPropagation();
                    displayStep(depth, i, true);
                    enterBranch(branchIndex);
                });
                branchControls.appendChild(button);
            });
            li.appendChild(branchControls);
        }
        targetUl.appendChild(li);
    });
}

function trimStateAfterDepth(depth: number): void {
    currentTargetLiAtDepth.splice(depth);
    currentTargetStepIdAtDepth.splice(depth);
    currentBranchIndexAtDepth.splice(depth);
    maxStepIdAtDepth.splice(depth);
    logsAtDepth.splice(depth);
}

function displayStep(depth: number, step: number, clickFlg: boolean): void {
    ensureLogsForDepth(depth);
    currentTargetStepIdAtDepth[depth] = step;
    currentTargetDepth = depth;
    trimStateAfterDepth(depth + 1);
    drawer.drawSteps(currentTargetStepIdAtDepth.slice(0, depth + 1));
    renderVisibleColumns();

    if (!clickFlg) {
        currentTargetLiAtDepth[depth]?.scrollIntoView({ block: "center" });
    }
}

function enterBranch(branchIndex = 0): void {
    const currentLogs = logsAtDepth[currentTargetDepth] ?? [];
    const currentStep = currentTargetStepIdAtDepth[currentTargetDepth];
    const currentLog = currentLogs[currentStep];
    const branch = currentLog?.getBranches()[branchIndex];
    if (!branch) {
        return;
    }

    const nextDepth = currentTargetDepth + 1;
    currentBranchIndexAtDepth[nextDepth] = branchIndex;
    logsAtDepth[nextDepth] = branch.logs;
    maxStepIdAtDepth[nextDepth] = branch.logs.length - 1;
    drawer.setResultLogs(nextDepth, branch.logs);
    currentTargetDepth = nextDepth;

    if (branch.logs.length > 0) {
        currentTargetStepIdAtDepth[nextDepth] = branch.logs.length - 1;
    } else {
        currentTargetStepIdAtDepth[nextDepth] = -1;
    }
    drawer.drawSteps(currentTargetStepIdAtDepth.slice(0, nextDepth + 1));
    renderVisibleColumns();
    currentTargetLiAtDepth[nextDepth]?.scrollIntoView({ block: "center" });
}

function moveStep(offset: number): void {
    if (!solvedFlg) {
        return;
    }
    const currentStep = currentTargetStepIdAtDepth[currentTargetDepth];
    const nextStep = currentStep === -1 ? 0 : currentStep + offset;
    if (nextStep >= 0 && nextStep <= maxStepIdAtDepth[currentTargetDepth]) {
        displayStep(currentTargetDepth, nextStep, false);
    }
}

initialDisplay();

autoImport.addEventListener("change", changeAutoImport);
autoSolve.addEventListener("change", changeAutoSolve);
importButton.addEventListener("click", importUrl);
solveButton.addEventListener("click", solve);

urlElement.addEventListener("focusin", () => {
    tempUrlIn = urlElement.value;
});
urlElement.addEventListener("focusout", () => {
    tempUrlOut = urlElement.value;
    if (tempUrlIn !== tempUrlOut && autoImportFlg) {
        importUrl();
    }
});
urlElement.addEventListener("keydown", (keyEvent) => {
    if (keyEvent.key === "Enter") {
        solveDepthElement.focus();
    }
});

solveDepthElement.addEventListener("focusin", () => {
    tempDepthIn = solveDepthElement.value;
});
solveDepthElement.addEventListener("focusout", () => {
    tempDepthOut = solveDepthElement.value;
    if (tempDepthIn !== tempDepthOut && autoImportFlg) {
        importUrl();
    }
});
solveDepthElement.addEventListener("keydown", (keyEvent) => {
    if (keyEvent.key === "Enter") {
        urlElement.focus();
    }
});

document.addEventListener("keydown", (keyEvent) => {
    if (!solvedFlg) {
        return;
    }
    switch (keyEvent.key) {
        case "w":
            moveStep(-1);
            break;
        case "s":
            moveStep(1);
            break;
        case "a":
            if (currentTargetDepth > 0) {
                currentTargetDepth -= 1;
                drawer.drawSteps(currentTargetStepIdAtDepth.slice(0, currentTargetDepth + 1));
                renderVisibleColumns();
                currentTargetLiAtDepth[currentTargetDepth]?.scrollIntoView({ block: "center" });
            }
            break;
        case "d":
            enterBranch(0);
            break;
        default:
            if (/^[1-9]$/.test(keyEvent.key)) {
                enterBranch(Number(keyEvent.key) - 1);
            }
            break;
    }
});

bodyElement.dataset.initialized = "true";


