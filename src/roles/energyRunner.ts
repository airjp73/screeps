import { withdraw, transfer } from "creepFunctions/actions";
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
  getEnergy: {
    check: (creep: Creep) => {
      if (creep.store.getFreeCapacity() === 0) {
        return "dropOffEnergy";
      }
    },
    perform: (creep: Creep) => {
      if (creep.memory.target) {
        const target = Game.getObjectById(
          creep.memory.target
        ) as StructureContainer;
        withdraw(creep, target, () => creep.withdraw(target, RESOURCE_ENERGY));
      } else {
        console.error(`Runner creep ${creep.name} has no target container`);
      }
    },
  },
  dropOffEnergy: {
    check: (creep: Creep) => {
      if (creep.store.getUsedCapacity() === 0) {
        return "getEnergy";
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

export const energyRunner: CreepRoleDefinition = {
  role: "energyRunner",
  run: runCreepStateMachine(states),
  spawn: (spawner: StructureSpawn): void => {
    spawner.spawnCreep(
      [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],
      _.uniqueId(),
      {
        memory: {
          role: "energyRunner",
          room: spawner.room.name,
          state: "getEnergy",
          target: findSourceIdWithLeastHarvesters(spawner.room),
        },
      }
    );
  },
};
