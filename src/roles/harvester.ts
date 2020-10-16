import { harvest, transfer } from "creepFunctions/actions";
import { CreepStateMachine, runCreepStateMachine } from "./creepStateMachine";

const STRUCTURES_IN_NEED_OF_POWER: StructureConstant[] = [
  STRUCTURE_EXTENSION,
  STRUCTURE_SPAWN,
];
const needsPower = (structure: AnyStructure): structure is StructureStorage =>
  STRUCTURES_IN_NEED_OF_POWER.includes(structure.structureType);

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
      const targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) =>
          needsPower(structure) &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
      });
      if (targets.length > 0) {
        transfer(creep, targets[0], () =>
          creep.transfer(targets[0], RESOURCE_ENERGY)
        );
      }
    },
  },
};

export const harvester = {
  run: runCreepStateMachine(states),
  spawn: (spawner: StructureSpawn): void => {
    spawner.spawnCreep([WORK, CARRY, MOVE], _.uniqueId(), {
      memory: {
        role: "harvester",
        room: spawner.room.name,
        working: false,
        state: "harvesting",
      },
    });
  },
};
