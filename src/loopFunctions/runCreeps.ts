import { harvester } from "roles/harvester";
import { upgrader } from "roles/upgrader";
import { forEachCreep } from "utils/forEachCreep";
import { UnreachableCaseError } from "../utils/errors";

export const runCreeps = (): void => {
  forEachCreep((creep) => {
    switch (creep.memory.role) {
      case "harvester":
        return harvester.run(creep);
      case "upgrader":
        return upgrader.run(creep);
      default:
        throw new UnreachableCaseError(creep.memory.role);
    }
  });
};
