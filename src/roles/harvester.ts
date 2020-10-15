import { harvest } from "creepFunctions/actions";

const STRUCTURES_IN_NEED_OF_POWER: StructureConstant[] = [
  STRUCTURE_EXTENSION,
  STRUCTURE_SPAWN,
];
const needsPower = (structure: AnyStructure): structure is StructureStorage =>
  STRUCTURES_IN_NEED_OF_POWER.includes(structure.structureType);

export const harvester = {
  run: (creep: Creep): void => {
    if (creep.store.getFreeCapacity() > 0) {
      const sources = creep.room.find(FIND_SOURCES);
      if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    } else {
      const targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) =>
          needsPower(structure) &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
      });
      if (targets.length > 0) {
        harvest(creep, targets[0], () =>
          creep.transfer(targets[0], RESOURCE_ENERGY)
        );
      }
    }
  },
  spawn: (spawner: StructureSpawn): void => {
    spawner.spawnCreep([WORK, CARRY, MOVE], _.uniqueId(), {
      memory: { role: "harvester", room: spawner.room.name, working: false },
    });
  },
};
