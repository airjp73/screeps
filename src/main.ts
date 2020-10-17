import { cleanup } from "loopFunctions/cleanup";
import { ErrorMapper } from "utils/ErrorMapper";
import { runCreeps } from "loopFunctions/runCreeps";
import { checkCreepCounts } from "loopFunctions/checkCreepCounts";
import "utils/callables";
import { transitionoStaticMining } from "loopFunctions/transitionToStaticMining";

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  cleanup();
  transitionoStaticMining();
  checkCreepCounts();
  runCreeps();
});
