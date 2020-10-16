import { builder } from "roles/builder";
import { harvester } from "roles/harvester";
import { soldier } from "roles/soldier";
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
      case "builder":
        return builder.run(creep);
      case "soldier":
        return soldier.run(creep);
      default:
        throw new UnreachableCaseError(creep.memory.role);
    }
  });
};
