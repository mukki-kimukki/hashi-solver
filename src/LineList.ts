import { HashiController } from "./HashiController";
if(process.argv[0].length > 0){
    let hashiCntr:HashiController = new HashiController(process.argv[2]);
    hashiCntr.duplicate();
    hashiCntr.solve(0);
}