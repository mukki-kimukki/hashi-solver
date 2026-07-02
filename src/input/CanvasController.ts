import { HashiController } from "../solver/HashiController";
import { Num } from "../solver/Num";
import { ResultLog } from "../solver/ResultLog";
import { HashiBaseConstants as hbc } from "../solver/HashiBaseConstants";
import { UiConstants as uc } from "./UiConstants";
import { Address, DrawType, N4way } from "../common/Types";

export class CanvasController {
    private readonly numDict: Num[];
    private readonly width: number;
    private readonly height: number;
    private readonly lineWidth: number;
    private readonly lineSpacing: number;
    private readonly fontSize: string;

    private readonly linesCanvas: HTMLCanvasElement;
    private readonly linesContext: CanvasRenderingContext2D;
    private readonly linesMaskCanvas: HTMLCanvasElement;
    private readonly linesMaskContext: CanvasRenderingContext2D;
    private readonly targetCanvas: HTMLCanvasElement;
    private readonly targetContext: CanvasRenderingContext2D;
    private readonly targetMaskCanvas: HTMLCanvasElement;
    private readonly targetMaskContext: CanvasRenderingContext2D;
    private readonly numsBgCanvas: HTMLCanvasElement;
    private readonly numsBgContext: CanvasRenderingContext2D;
    private readonly numsMaskCanvas: HTMLCanvasElement;
    private readonly numsMaskContext: CanvasRenderingContext2D;
    private readonly numsCharCanvas: HTMLCanvasElement;
    private readonly numsCharContext: CanvasRenderingContext2D;

    private readonly numPosById: Map<number, Address> = new Map();
    private readonly numPathById: Map<number, Path2D> = new Map();
    private readonly logsByDepth: ResultLog[][] = [];
    private readonly pathsByDepth: Path2D[][] = [];
    private readonly maskPathsByDepth: Map<number, Path2D>[] = [];

    constructor(hashiCtrl: HashiController) {
        this.numDict = hashiCtrl.getNumDict()[0];
        this.width = (hashiCtrl.getWidth() + 1) * uc.gridSize;
        this.height = (hashiCtrl.getHeight() + 1) * uc.gridSize;
        this.lineWidth = uc.gridSize / 15;
        this.lineSpacing = uc.gridSize / 5;
        this.fontSize = String(uc.gridSize * 3 / 5) + "px";

        this.linesCanvas = this.getCanvas("linesCanvas");
        this.linesContext = this.getContext(this.linesCanvas);
        this.linesMaskCanvas = this.getCanvas("linesMaskCanvas");
        this.linesMaskContext = this.getContext(this.linesMaskCanvas);
        this.targetCanvas = this.getCanvas("targetCanvas");
        this.targetContext = this.getContext(this.targetCanvas);
        this.targetMaskCanvas = this.getCanvas("targetMaskCanvas");
        this.targetMaskContext = this.getContext(this.targetMaskCanvas);
        this.numsBgCanvas = this.getCanvas("numsBgCanvas");
        this.numsBgContext = this.getContext(this.numsBgCanvas);
        this.numsMaskCanvas = this.getCanvas("numsMaskCanvas");
        this.numsMaskContext = this.getContext(this.numsMaskCanvas);
        this.numsCharCanvas = this.getCanvas("numsCharCanvas");
        this.numsCharContext = this.getContext(this.numsCharCanvas);

        [
            this.linesCanvas,
            this.linesMaskCanvas,
            this.targetCanvas,
            this.targetMaskCanvas,
            this.numsBgCanvas,
            this.numsMaskCanvas,
            this.numsCharCanvas,
        ].forEach((canvas) => {
            canvas.width = this.width;
            canvas.height = this.height;
        });

        this.linesContext.strokeStyle = uc.lineColor;
        this.linesContext.lineWidth = this.lineWidth;
        this.targetContext.strokeStyle = uc.tgtColor;
        this.targetContext.lineWidth = this.lineWidth;
        this.linesMaskContext.fillStyle = uc.bgColor;
        this.targetMaskContext.fillStyle = uc.bgColor;
        this.numsBgContext.fillStyle = uc.bgColor;
        this.numsMaskContext.globalAlpha = 0.25;
        this.numsCharContext.strokeStyle = uc.lineColor;
        this.numsCharContext.fillStyle = uc.lineColor;
        this.numsCharContext.font = this.fontSize + " Meiryo";

        const divCanvas = document.getElementById("divCanvas") as HTMLElement;
        divCanvas.style.width = String(this.width) + "px";
        divCanvas.style.height = String(this.height) + "px";

        this.drawBoardNumbers(hashiCtrl.getBoardAbst());
    }

    public drawAllResult(depth: number, logs: ResultLog[], drawType: DrawType): void {
        if (drawType !== DrawType.solver) {
            return;
        }
        this.setResultLogs(depth, logs);
        this.drawSteps([logs.length - 1]);
    }

    public setResultLogs(depth: number, logs: ResultLog[]): void {
        this.logsByDepth[depth] = logs;
        const built = this.buildPaths(logs);
        this.pathsByDepth[depth] = built.paths;
        this.maskPathsByDepth[depth] = built.maskPaths;
    }

    public drawSteps(selectionPath: number[]): void {
        this.clearLines();
        const drawnEdges = new Map<string, number>();
        selectionPath.forEach((selectedStep, depth) => {
            const paths = this.pathsByDepth[depth] ?? [];
            const maskPaths = this.maskPathsByDepth[depth] ?? new Map<number, Path2D>();
            const maxStep = Math.min(selectedStep, paths.length - 1);
            for (let i = 0; i <= maxStep; i++) {
                const maskPath = maskPaths.get(i);
                if (maskPath) {
                    this.linesMaskContext.fill(maskPath);
                }
                this.linesContext.stroke(paths[i]);
            }
        });

        const targetDepth = selectionPath.length - 1;
        const targetStep = selectionPath[targetDepth];
        const targetPath = this.pathsByDepth[targetDepth]?.[targetStep];
        if (targetPath) {
            const targetMaskPath = this.maskPathsByDepth[targetDepth]?.get(targetStep);
            if (targetMaskPath) {
                this.targetMaskContext.fill(targetMaskPath);
            }
            this.targetContext.stroke(targetPath);
        }

        this.drawHighlights(selectionPath);
        drawnEdges.clear();
    }

    public clearAll(): void {
        this.linesContext.clearRect(0, 0, this.width, this.height);
        this.linesMaskContext.clearRect(0, 0, this.width, this.height);
        this.targetContext.clearRect(0, 0, this.width, this.height);
        this.targetMaskContext.clearRect(0, 0, this.width, this.height);
        this.numsMaskContext.clearRect(0, 0, this.width, this.height);
        this.drawBoardNumbersFromCache();
    }

    private getCanvas(id: string): HTMLCanvasElement {
        return document.getElementById(id) as HTMLCanvasElement;
    }

    private getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
        return canvas.getContext("2d") as CanvasRenderingContext2D;
    }

    private drawBoardNumbers(boardAbst: number[][]): void {
        this.numPosById.clear();
        this.numPathById.clear();
        this.numsBgContext.clearRect(0, 0, this.width, this.height);
        this.numsCharContext.clearRect(0, 0, this.width, this.height);
        this.numsBgContext.fillStyle = uc.bgColor;
        this.numsCharContext.fillStyle = uc.lineColor;
        this.numsCharContext.strokeStyle = uc.lineColor;
        this.numsCharContext.font = this.fontSize + " Meiryo";

        let id = 0;
        boardAbst.forEach((row, y) => {
            row.forEach((hintNumber, x) => {
                if (hintNumber > 0) {
                    const center = this.toCanvasAddress({ x, y });
                    const numPath = new Path2D();
                    numPath.arc(center.x, center.y, uc.gridSize / 3, 0, Math.PI * 2);
                    numPath.closePath();
                    this.numPosById.set(id, center);
                    this.numPathById.set(id, numPath);
                    this.numsBgContext.fill(numPath);
                    this.numsCharContext.stroke(numPath);
                    this.numsCharContext.fillText(String(hintNumber), center.x - uc.gridSize / 5, center.y + uc.gridSize / 5);
                    id += 1;
                }
            });
        });
    }

    private drawBoardNumbersFromCache(): void {
        this.numsBgContext.clearRect(0, 0, this.width, this.height);
        this.numsCharContext.clearRect(0, 0, this.width, this.height);
        this.numPathById.forEach((path, id) => {
            const num = this.numDict[id];
            const pos = this.numPosById.get(id);
            if (!pos) {
                return;
            }
            this.numsBgContext.fill(path);
            this.numsCharContext.stroke(path);
            this.numsCharContext.fillText(String(num.getOriginalNumber()), pos.x - uc.gridSize / 5, pos.y + uc.gridSize / 5);
        });
    }

    private buildPaths(logs: ResultLog[]): { paths: Path2D[]; maskPaths: Map<number, Path2D> } {
        const paths: Path2D[] = [];
        const maskPaths: Map<number, Path2D> = new Map();
        const edgeCounts = new Map<string, number>();

        logs.forEach((log, step) => {
            const path = new Path2D();
            const maskPath = new Path2D();
            let masked = false;
            const targetIds = log.getTargetNumIdList();

            log.getResult4wayList().forEach((result4way, resultIndex) => {
                const rootNumId = targetIds[resultIndex];
                if (typeof rootNumId !== "number" || rootNumId < 0) {
                    return;
                }
                const rootNum = this.numDict[rootNumId];
                const rootPos = this.numPosById.get(rootNumId);
                if (!rootNum || !rootPos) {
                    return;
                }

                result4way.forEach((value: number, dir: number) => {
                    if (value > 0) {
                        const toId = rootNum.getSurNumId()[dir];
                        const toPos = this.numPosById.get(toId);
                        if (!toPos) {
                            return;
                        }
                        const edgeKey = this.edgeKey(rootNumId, toId);
                        const currentCount = edgeCounts.get(edgeKey) ?? 0;
                        this.addLinePath(path, maskPath, rootPos, toPos, value, currentCount);
                        masked = masked || currentCount > 0 || value === 2;
                        edgeCounts.set(edgeKey, currentCount + value);
                    } else if (value < 0) {
                        this.addCrossPath(path, rootPos, dir);
                    }
                });
            });

            paths[step] = path;
            if (masked) {
                maskPaths.set(step, maskPath);
            }
        });

        return { paths, maskPaths };
    }

    private addLinePath(path: Path2D, maskPath: Path2D, from: Address, to: Address, count: number, currentCount: number): void {
        if (currentCount > 0 || count === 2) {
            if (from.x === to.x) {
                path.rect(from.x - this.lineSpacing / 2, Math.min(from.y, to.y), this.lineSpacing, Math.abs(from.y - to.y));
                maskPath.rect(from.x - (this.lineSpacing - this.lineWidth) / 2, Math.min(from.y, to.y), this.lineSpacing - this.lineWidth, Math.abs(from.y - to.y));
            } else {
                path.rect(Math.min(from.x, to.x), from.y - this.lineSpacing / 2, Math.abs(from.x - to.x), this.lineSpacing);
                maskPath.rect(Math.min(from.x, to.x), from.y - (this.lineSpacing - this.lineWidth) / 2, Math.abs(from.x - to.x), this.lineSpacing - this.lineWidth);
            }
        } else {
            path.moveTo(from.x, from.y);
            path.lineTo(to.x, to.y);
        }
    }

    private addCrossPath(path: Path2D, root: Address, dir: number): void {
        const xPosAdd = hbc.dirX[dir] * uc.gridSize / 2;
        const yPosAdd = hbc.dirY[dir] * uc.gridSize / 2;
        const diff = uc.gridSize / 6;
        path.moveTo(root.x + xPosAdd - diff, root.y + yPosAdd - diff);
        path.lineTo(root.x + xPosAdd + diff, root.y + yPosAdd + diff);
        path.moveTo(root.x + xPosAdd - diff, root.y + yPosAdd + diff);
        path.lineTo(root.x + xPosAdd + diff, root.y + yPosAdd - diff);
    }

    private drawHighlights(selectionPath: number[]): void {
        this.numsMaskContext.clearRect(0, 0, this.width, this.height);
        const depth = selectionPath.length - 1;
        const step = selectionPath[depth];
        const log = this.logsByDepth[depth]?.[step];
        if (!log) {
            return;
        }

        const checkNumIds = log.getCheckedNumIdList().concat();
        const targetNumIds = log.getTargetNumIdList().concat();
        targetNumIds.forEach((id) => {
            const index = checkNumIds.indexOf(id);
            if (index >= 0) {
                checkNumIds.splice(index, 1);
            }
        });

        this.numsMaskContext.fillStyle = uc.checkFillColor;
        checkNumIds.forEach((id) => this.fillNumMask(id));
        this.numsMaskContext.fillStyle = uc.tgtFillColor;
        targetNumIds.forEach((id) => this.fillNumMask(id));
    }

    private fillNumMask(id: number): void {
        const path = this.numPathById.get(id);
        if (path) {
            this.numsMaskContext.fill(path);
        }
    }

    private toCanvasAddress(address: Address): Address {
        return {
            x: (address.x + 1) * uc.gridSize,
            y: (address.y + 1) * uc.gridSize,
        };
    }

    private edgeKey(id1: number, id2: number): string {
        return id1 < id2 ? `${id1}:${id2}` : `${id2}:${id1}`;
    }

    private clearLines(): void {
        this.linesContext.clearRect(0, 0, this.width, this.height);
        this.linesMaskContext.clearRect(0, 0, this.width, this.height);
        this.targetContext.clearRect(0, 0, this.width, this.height);
        this.targetMaskContext.clearRect(0, 0, this.width, this.height);
        this.numsMaskContext.clearRect(0, 0, this.width, this.height);
    }
}

