import { transfer, withdraw } from "creepFunctions/actions";
import { getClosestContainer } from "creepFunctions/getEnergy";
import {
  CreepRoleDefinition,
  CreepStateMachine,
  runCreepStateMachine,
} from "./creepStateMachine";

const states: CreepStateMachine = {
  harvesting: {
    check: (creep: Creep) => {
      if (creep.store.getFreeCapacity() === 0) {
        return "transfering";
      }
    },
    perform: (creep: Creep) => {
      if (!creep.room.controller) return;
      const container = getClosestContainer(creep.room.controller);
      withdraw(creep, container, () =>
        creep.withdraw(container, RESOURCE_ENERGY)
      );
    },
  },
  transfering: {
    check: (creep: Creep) => {
      if (creep.store.getUsedCapacity() === 0) {
        return "harvesting";
      }
    },
    perform: (creep: Creep) => {
      const controller = creep.room.controller;
      if (controller) {
        transfer(creep, controller, () =>
          creep.transfer(controller, RESOURCE_ENERGY)
        );
      }
    },
  },
};

const level1Parts = [WORK, CARRY, MOVE];
const level2Parts = [WORK, WORK, WORK, WORK, CARRY, MOVE];
const level3Parts = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE];
export const upgrader: CreepRoleDefinition = {
  role: "upgrader",
  run: runCreepStateMachine(states),
  spawn: (spawner, roleCounts, numExtensions) => {
    if (roleCounts.upgrader >= 4) return false;
    const getParts = () => {
      if (numExtensions < 5) return level1Parts;
      if (numExtensions < 10) return level2Parts;
      return level3Parts;
    };
    spawner.spawnCreep(getParts(), _.uniqueId(), {
      memory: {
        role: "upgrader",
        room: spawner.room.name,
        state: "harvesting",
        target: spawner.room.controller?.id,
      },
    });
    return true;
  },
};
