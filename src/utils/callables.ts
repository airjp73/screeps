import { findSourceIdWithLeastHarvesters } from "./findSourceIdWithLeastHarvesters";

(global as any).reallocateHarvesters = () => {
  Object.values(Game.creeps)
    .filter((creep) => creep.memory.role === "harvester")
    .forEach((creep) => {
      creep.memory.target = undefined;
    });
  Object.values(Game.creeps)
    .filter((creep) => creep.memory.role === "harvester")
    .forEach((creep) => {
      const target = findSourceIdWithLeastHarvesters(creep.room);
      creep.memory.target = target;
    });
};
