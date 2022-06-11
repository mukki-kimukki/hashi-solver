import { HashiController } from "./HashiController";
if(process.argv[0].length > 0){
    let hashiCntr:HashiController = new HashiController(process.argv[3]);
    hashiCntr.solve(Number(process.argv[2]));
}