import { build, harvest } from "creepFunctions/actions";
import { getClosest, getCreepTarget } from "creepFunctions/targetAquireing";
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

export const builder: CreepRoleDefinition = {
  role: "builder",
  run: runCreepStateMachine(states),
  spawn: (spawner: StructureSpawn): void => {
    spawner.spawnCreep([WORK, CARRY, MOVE], _.uniqueId(), {
      memory: {
        role: "builder",
        room: spawner.room.name,
        state: "idle",
      },
    });
  },
};
