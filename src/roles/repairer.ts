import { repair, harvest } from "creepFunctions/actions";
import { getClosest, getCreepTarget } from "creepFunctions/targetAquireing";
import {
  CreepRoleDefinition,
  CreepStateMachine,
  runCreepStateMachine,
  setCreepState,
} from "./creepStateMachine";

const STRUCTURE_PRIORITIES = [STRUCTURE_CONTAINER];
export const aquireTarget = (room: Room): string => {
  console.log("aquire repair target");
  for (const priority of STRUCTURE_PRIORITIES) {
    const prioritizedStructures = room.find(FIND_STRUCTURES, {
      filter: (site) =>
        site.hits < site.hitsMax && site.structureType === priority,
    });
    if (prioritizedStructures.length) return prioritizedStructures[0].id;
  }

  const targets = room.find(FIND_STRUCTURES, {
    filter: (site) => site.hits < site.hitsMax,
  });
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
        return "repairing";
      }
      const target = getCreepTarget<Structure>(creep);
      if (!target || target.hits === target.hitsMax)
        return setCreepState({ target: aquireTarget(creep.room) });
    },
    perform: (creep: Creep) => {
      const sources = creep.room.find(FIND_SOURCES);
      const target = getCreepTarget(creep);
      if (target) {
        const closestSourceToTarget = getClosest(sources, target);
        harvest(creep, closestSourceToTarget, () =>
          creep.harvest(closestSourceToTarget)
        );
      }
    },
  },
  repairing: {
    check: (creep: Creep) => {
      if (creep.store.getUsedCapacity() === 0) {
        return "harvesting";
      }
      const target = getCreepTarget<Structure>(creep);
      if (!target || target.hits === target.hitsMax)
        return setCreepState({ target: aquireTarget(creep.room) });
    },
    perform: (creep: Creep) => {
      const target = getCreepTarget<Structure>(creep);
      if (target) {
        repair(creep, target, () => creep.repair(target));
      }
    },
  },
};

export const repairer: CreepRoleDefinition = {
  role: "repairer",
  run: runCreepStateMachine(states),
  spawn: (spawner: StructureSpawn): void => {
    spawner.spawnCreep([WORK, CARRY, MOVE], _.uniqueId(), {
      memory: {
        role: "repairer",
        room: spawner.room.name,
        state: "idle",
      },
    });
  },
};
