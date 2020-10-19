import { transfer } from "creepFunctions/actions";
import {
  getDroppedEnergyIfPresent,
  getEnergyFromSource,
  getClosestContainer,
} from "creepFunctions/getEnergy";
import { GamePhase } from "enums";
import { findSourceIdWithLeastHarvesters } from "utils/findSourceIdWithLeastHarvesters";
import {
  CreepRoleDefinition,
  CreepStateMachine,
  runCreepStateMachine,
} from "./creepStateMachine";

const STRUCTURES_IN_NEED_OF_POWER: StructureConstant[] = [
  STRUCTURE_SPAWN,
  STRUCTURE_EXTENSION,
  STRUCTURE_TOWER,
];
const needsPower = (structure: AnyStructure): structure is StructureStorage =>
  STRUCTURES_IN_NEED_OF_POWER.includes(structure.structureType);
const hasCapacity = (structure: StructureStorage): boolean =>
  structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
const findIndex = (type: StructureConstant): number =>
  STRUCTURES_IN_NEED_OF_POWER.findIndex((item) => item === type);
const sortyByPriority = (a: AnyStructure, b: AnyStructure): number =>
  findIndex(a.structureType) - findIndex(b.structureType);

const states: CreepStateMachine = {
  harvesting: {
    check: (creep: Creep) => {
      if (creep.store.getFreeCapacity() === 0) {
        return "transfering";
      }
      if (!creep.memory.target) {
        creep.memory.target = findSourceIdWithLeastHarvesters(creep.room);
      }
    },
    perform: (creep: Creep) => {
      if (getDroppedEnergyIfPresent(creep)) return;
      if (!creep.memory.target) {
        Game.notify(`Runner creep ${creep.name} has no target`);
        return;
      }
      const source = Game.getObjectById(creep.memory.target) as Source;
      getEnergyFromSource(creep, source);
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
            needsPower(structure) && hasCapacity(structure),
        })
        .sort(sortyByPriority);
      const target =
        targets[0] ??
        (creep.room.controller && getClosestContainer(creep.room.controller));
      if (target) {
        transfer(creep, target, () => creep.transfer(target, RESOURCE_ENERGY));
      } else {
        console.log(`Creep ${creep.name} unable to find place to dump energy`);
      }
    },
  },
};

const superHarvesterParts = [
  CARRY,
  CARRY,
  CARRY,
  CARRY,
  CARRY,
  CARRY,
  MOVE,
  MOVE,
  MOVE,
  MOVE,
];
const baseHarvesterParts = [WORK, CARRY, MOVE];
const getNumHarvesters = () =>
  Object.values(Game.creeps).filter(
    (creep) => creep.memory.role === "harvester"
  ).length;

export const harvester: CreepRoleDefinition = {
  role: "harvester",
  run: runCreepStateMachine(states),
  spawn: (spawner: StructureSpawn): void => {
    const target = findSourceIdWithLeastHarvesters(spawner.room);
    const name = _.uniqueId();
    const spawn = (parts: BodyPartConstant[]) =>
      spawner.spawnCreep(parts, name, {
        memory: {
          role: "harvester",
          room: spawner.room.name,
          state: "harvesting",
          target,
        },
      });

    if (Memory.phase >= GamePhase.ACTIVE_STATIC_HARVESTING) {
      const result = spawn(superHarvesterParts);
      // Consider edge-case where all the harvesters are dead
      if (result === ERR_NOT_ENOUGH_ENERGY && getNumHarvesters() === 0) {
        spawn(baseHarvesterParts);
      }
    } else {
      spawn(baseHarvesterParts);
    }
  },
};
