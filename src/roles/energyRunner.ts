import { transfer } from "creepFunctions/actions";
import {
  getDroppedEnergyIfPresent,
  getEnergyFromSource,
} from "creepFunctions/getEnergy";
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

// const parts = [
//   CARRY,
//   CARRY,
//   CARRY,
//   CARRY,
//   CARRY,
//   CARRY,
//   MOVE,
//   MOVE,
//   MOVE,
//   MOVE,
// ];
// const getNumHarvesters = () =>
//   Object.values(Game.creeps).filter(
//     (creep) => creep.memory.role === "harvester"
//   ).length;

export const energyRunner: CreepRoleDefinition = {
  role: "energyRunner",
  run: runCreepStateMachine(states),
  spawn: () => {
    Game.notify("Attempted to spawn an energy runner");
    return false;
  },

  // spawn: (spawner: StructureSpawn): boolean => {
  //   const target = findSourceIdWithLeastHarvesters(spawner.room);
  //   const name = _.uniqueId();
  //   const spawn = (parts: BodyPartConstant[]) =>
  //     spawner.spawnCreep(parts, name, {
  //       memory: {
  //         role: "harvester",
  //         room: spawner.room.name,
  //         state: "harvesting",
  //         target,
  //       },
  //     });

  //   if (Memory.phase >= GamePhase.ACTIVE_STATIC_HARVESTING) {
  //     const result = spawn(parts);
  //     // Consider edge-case where all the harvesters are dead
  //     if (result === ERR_NOT_ENOUGH_ENERGY && getNumHarvesters() === 0) {
  //       spawn(baseHarvesterParts);
  //     }
  //   } else {
  //     spawn(baseHarvesterParts);
  //   }
  // },
};
