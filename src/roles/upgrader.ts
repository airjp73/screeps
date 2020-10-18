import { transfer } from "creepFunctions/actions";
import { getEnergy } from "creepFunctions/getEnergy";
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
    perform: (creep: Creep) => getEnergy(creep),
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

export const upgrader: CreepRoleDefinition = {
  role: "upgrader",
  run: runCreepStateMachine(states),
  spawn: (spawner: StructureSpawn): void => {
    spawner.spawnCreep([WORK, CARRY, MOVE], _.uniqueId(), {
      memory: {
        role: "upgrader",
        room: spawner.room.name,
        state: "harvesting",
        target: spawner.room.controller?.id,
      },
    });
  },
};
