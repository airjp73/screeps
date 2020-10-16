export const findSourceIdWithLeastHarvesters = (room: Room): string => {
  const sourceCounts = {} as Record<string, number>;
  const sources = room.find(FIND_SOURCES);
  sources.forEach((source) => {
    sourceCounts[source.id] = 0;
  });
  Object.values(Game.creeps).forEach((creep) => {
    if (creep.memory.target) {
      sourceCounts[creep.memory.target] = sourceCounts[creep.memory.target] + 1;
    }
  });
  return Object.entries(sourceCounts).sort((a, b) => a[1] - b[1])[0][0];
};
