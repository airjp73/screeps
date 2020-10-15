import { uniqueId } from "lodash";

export const harvester = {
  run: (creep: Creep): void => {
    console.log(creep.name);
  },
  spawn: (spawner: StructureSpawn): void => {
    spawner.spawnCreep([WORK, CARRY, MOVE], uniqueId(), {
      memory: { role: "harvester", room: spawner.room.name, working: false },
    });
  },
};
