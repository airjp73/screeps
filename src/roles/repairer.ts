import { repair, harvest } from "creepFunctions/actions";
import { CreepStateMachine, runCreepStateMachine } from "./creepStateMachine";

const states: CreepStateMachine = {
  harvesting: {
    check: (creep: Creep) => {
      if (creep.store.getFreeCapacity() === 0) {
        return "building";
      }
    },
    perform: (creep: Creep) => {
      const sources = creep.room.find(FIND_SOURCES);
      harvest(creep, sources[0], () => creep.harvest(sources[0]));
    },
  },
  building: {
    check: (creep: Creep) => {
      if (creep.store.getUsedCapacity() === 0) {
        return "harvesting";
      }
    },
    perform: (creep: Creep) => {
      const targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.hits < structure.hitsMax,
      });
      if (targets.length) {
        repair(creep, targets[0], () => creep.repair(targets[0]));
      }
    },
  },
};

export const repairer = {
  run: runCreepStateMachine(states),
  spawn: (spawner: StructureSpawn): void => {
    spawner.spawnCreep([WORK, CARRY, MOVE], _.uniqueId(), {
      memory: {
        role: "repairer",
        room: spawner.room.name,
        state: "harvesting",
      },
    });
  },
};
