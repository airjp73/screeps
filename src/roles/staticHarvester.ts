import { harvest, transfer } from "creepFunctions/actions";
import { getClosest } from "creepFunctions/targetAquireing";
import {
  CreepRoleDefinition,
  CreepStateMachine,
  runCreepStateMachine,
} from "./creepStateMachine";

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
        console.error(`Creep ${creep.id} is missing a target`);
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
      const containers = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_CONTAINER,
      });
      const closest = getClosest(containers, creep);
      if (closest) {
        transfer(creep, closest, () =>
          creep.transfer(closest, RESOURCE_ENERGY)
        );
      } else {
        console.error(`Unable to find container for ${creep.id}`);
      }
    },
  },
};

export const staticHarvester: CreepRoleDefinition = {
  role: "staticHarvester",
  run: runCreepStateMachine(states),
  spawn: (spawner: StructureSpawn): void => {
    const sources = spawner.room.find(FIND_SOURCES, {
      filter: (source) =>
        !Object.values(Memory.harvesterSources).includes(source.id),
    });
    if (sources.length) {
      spawner.spawnCreep([WORK, WORK, WORK, WORK, WORK, MOVE], _.uniqueId(), {
        memory: {
          role: "staticHarvester",
          room: spawner.room.name,
          state: "harvesting",
          target: sources[0].id,
        },
      });
    } else {
      console.error("Attempted to spawn static harvester with no free sources");
    }
  },
};
