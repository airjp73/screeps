import { harvest, transfer } from "creepFunctions/actions";
import { findSourceIdWithLeastHarvesters } from "utils/findSourceIdWithLeastHarvesters";
import {
  CreepRoleDefinition,
  CreepStateMachine,
  runCreepStateMachine,
} from "./creepStateMachine";

const STRUCTURES_IN_NEED_OF_POWER: StructureConstant[] = [
  STRUCTURE_SPAWN,
  STRUCTURE_EXTENSION,
];
const STRUCTURE_PRIORITY = [
  ...STRUCTURES_IN_NEED_OF_POWER,
  STRUCTURE_CONTROLLER,
];
const needsPower = (structure: AnyStructure): structure is StructureStorage =>
  STRUCTURES_IN_NEED_OF_POWER.includes(structure.structureType);
const findIndex = (type: StructureConstant): number =>
  STRUCTURE_PRIORITY.findIndex((item) => item === type);
const sortyByPriority = (a: AnyStructure, b: AnyStructure): number =>
  findIndex(a.structureType) - findIndex(b.structureType);

const states: CreepStateMachine = {
  harvesting: {
    check: (creep: Creep) => {
      if (creep.store.getFreeCapacity() === 0) {
        return "transfering";
      }
    },
    perform: (creep: Creep) => {
      if (creep.memory.target) {
        const target = Game.getObjectById(creep.memory.target) as Source;
        harvest(creep, target, () => creep.harvest(target));
      } else {
        const sources = creep.room.find(FIND_SOURCES);
        harvest(creep, sources[0], () => creep.harvest(sources[0]));
      }
    },
  },
  transfering: {
    check: (creep: Creep) => {
      if (creep.store.getUsedCapacity() === 0) {
        return "harvesting";
      }
    },
    perform: (creep: Creep) => {
      const targets = creep.room
        .find(FIND_STRUCTURES, {
          filter: (structure) =>
            (needsPower(structure) &&
              structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0) ||
            structure.structureType === STRUCTURE_CONTROLLER,
        })
        .sort(sortyByPriority);
      if (targets.length > 0) {
        transfer(creep, targets[0], () =>
          creep.transfer(targets[0], RESOURCE_ENERGY)
        );
      }
    },
  },
};

export const harvester: CreepRoleDefinition = {
  role: "harvester",
  run: runCreepStateMachine(states),
  spawn: (spawner: StructureSpawn): void => {
    spawner.spawnCreep([WORK, CARRY, MOVE], _.uniqueId(), {
      memory: {
        role: "harvester",
        room: spawner.room.name,
        state: "harvesting",
        target: findSourceIdWithLeastHarvesters(spawner.room),
      },
    });
  },
};
