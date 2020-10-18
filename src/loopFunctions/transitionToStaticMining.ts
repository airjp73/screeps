import { GamePhase } from "enums";

export const transitionoStaticMining = (): void => {
  if (Memory.phase < GamePhase.SETUP_STATIC_HARVESTING) return;
  if (
    Object.values(Game.creeps).some(
      (creep) => creep.memory.role === "staticHarvester"
    )
  ) {
    Memory.phase = GamePhase.ACTIVE_STATIC_HARVESTING;
  } else {
    Memory.phase = GamePhase.SETUP_STATIC_HARVESTING;
  }
  // if (Memory.targetCreepCounts) Memory.targetCreepCounts.harvester = 0;

  // Object.values(Memory.harvesterSources ?? {}).forEach((sourceId) => {
  //   const source = Game.getObjectById(sourceId);
  //   if (!source) return;

  //   const containers =
  //     source.room.find(FIND_STRUCTURES, {
  //       filter: (structure) => structure.structureType === STRUCTURE_CONTAINER,
  //     }) ?? [];
  //   const closestContainer = getClosest(containers, source);

  //   Object.values(Game.creeps)
  //     .filter(
  //       (creep) =>
  //         creep.memory.role === "harvester" && creep.memory.target === sourceId
  //     )
  //     .forEach((harvester) => {
  //       harvester.memory.role = "energyRunner";
  //       harvester.memory.target = closestContainer.id;
  //     });
  // });

  // Object.values(Game.creeps)
  //   .filter((creep) => creep.memory.role === "upgrader")
  //   .forEach((creep) => {
  //     creep.memory.target = creep.room.controller?.id;
  //   });
};
