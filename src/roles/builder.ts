import { build, harvest } from "creepFunctions/actions";
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
      const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        build(creep, targets[0], () => creep.build(targets[0]));
      }
    },
  },
};

export const builder = {
  run: runCreepStateMachine(states),
  spawn: (spawner: StructureSpawn): void => {
    spawner.spawnCreep([WORK, CARRY, MOVE], _.uniqueId(), {
      memory: {
        role: "builder",
        room: spawner.room.name,
        state: "harvesting",
      },
    });
  },
};
