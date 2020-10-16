import { harvest, transfer } from "creepFunctions/actions";
import { CreepStateMachine, runCreepStateMachine } from "./creepStateMachine";

const states: CreepStateMachine = {
  harvesting: {
    check: (creep: Creep) => {
      if (creep.store.getFreeCapacity() === 0) {
        return "transfering";
      }
    },
    perform: (creep: Creep) => {
      const sources = creep.room.find(FIND_SOURCES);
      harvest(creep, sources[0], () => creep.harvest(sources[0]));
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

export const upgrader = {
  run: runCreepStateMachine(states),
  spawn: (spawner: StructureSpawn): void => {
    spawner.spawnCreep([WORK, CARRY, MOVE], _.uniqueId(), {
      memory: {
        role: "upgrader",
        room: spawner.room.name,
        working: false,
        state: "harvesting",
      },
    });
  },
};
