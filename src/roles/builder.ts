import { build } from "creepFunctions/actions";
import { getEnergy } from "creepFunctions/getEnergy";
import { getCreepTarget } from "creepFunctions/targetAquireing";
import {
  CreepRoleDefinition,
  CreepStateMachine,
  runCreepStateMachine,
  setCreepState,
} from "./creepStateMachine";

const STRUCTURE_PRIORITIES = [STRUCTURE_EXTENSION, STRUCTURE_CONTAINER];
export const aquireTarget = (room: Room): string => {
  for (const priority of STRUCTURE_PRIORITIES) {
    const prioritizedStructures = room.find(FIND_CONSTRUCTION_SITES, {
      filter: (site) => site.structureType === priority,
    });
    if (prioritizedStructures.length) return prioritizedStructures[0].id;
  }

  const targets = room.find(FIND_CONSTRUCTION_SITES);
  return targets[0]?.id;
};

const states: CreepStateMachine = {
  idle: {
    check: (creep: Creep) => {
      return setCreepState({
        state: "harvesting",
        target: aquireTarget(creep.room),
      });
    },
    perform: () => {
      // no-op
    },
  },
  harvesting: {
    check: (creep: Creep) => {
      if (creep.store.getFreeCapacity() === 0) {
        return "building";
      }
      if (!getCreepTarget(creep))
        return setCreepState({ target: aquireTarget(creep.room) });
    },
    perform: (creep: Creep) => getEnergy(creep),
  },
  building: {
    check: (creep: Creep) => {
      if (creep.store.getUsedCapacity() === 0) {
        return "harvesting";
      }
      if (!getCreepTarget(creep))
        return setCreepState({ target: aquireTarget(creep.room) });
    },
    perform: (creep: Creep) => {
      const target = getCreepTarget<ConstructionSite>(creep);
      if (target) {
        build(creep, target, () => creep.build(target));
      }
    },
  },
};

const level1Parts = [WORK, CARRY, MOVE];
const level2Parts = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
const level3Parts = [
  WORK,
  WORK,
  WORK,
  WORK,
  CARRY,
  CARRY,
  CARRY,
  CARRY,
  MOVE,
  MOVE,
  MOVE,
  MOVE,
];
const level4Parts = [
  WORK,
  WORK,
  WORK,
  WORK,
  WORK,
  CARRY,
  CARRY,
  CARRY,
  CARRY,
  CARRY,
  MOVE,
  MOVE,
  MOVE,
  MOVE,
  MOVE,
  MOVE,
];
export const builder: CreepRoleDefinition = {
  role: "builder",
  run: runCreepStateMachine(states),
  spawn: (spawner, roleCounts, numExtensions) => {
    const numBuilder = roleCounts.builder ?? 0;
    if (numBuilder >= 4) return false;
    const spawn = (parts: BodyPartConstant[]) =>
      spawner.spawnCreep(parts, _.uniqueId(), {
        memory: {
          role: "builder",
          room: spawner.room.name,
          state: "idle",
        },
      });

    const getParts = () => {
      if (numExtensions < 5) return level1Parts;
      if (numExtensions < 10) return level2Parts;
      if (numExtensions < 15) return level3Parts;
      return level4Parts;
    };
    spawn(getParts());
    return true;
  },
};
