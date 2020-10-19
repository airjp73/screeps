import { transfer } from "creepFunctions/actions";
import { getEnergy } from "creepFunctions/getEnergy";
import { GamePhase } from "enums";
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

const basicParts = [WORK, CARRY, MOVE];
const advancedParts = [WORK, WORK, WORK, WORK, CARRY, MOVE];
export const upgrader: CreepRoleDefinition = {
  role: "upgrader",
  run: runCreepStateMachine(states),
  spawn: (spawner: StructureSpawn): void => {
    const parts =
      Memory.phase === GamePhase.ACTIVE_STATIC_HARVESTING
        ? advancedParts
        : basicParts;
    spawner.spawnCreep(parts, _.uniqueId(), {
      memory: {
        role: "upgrader",
        room: spawner.room.name,
        state: "harvesting",
        target: spawner.room.controller?.id,
      },
    });
  },
};
