export const getCreepTarget = <T extends RoomObject>(
  creep: Creep
): T | undefined =>
  creep.memory.target
    ? (Game.getObjectById(creep.memory.target) as T)
    : undefined;

export const getClosest = <T extends RoomObject>(
  objects: T[],
  target: RoomObject
): T => {
  const sortedByDistance = _.sortBy(objects, (s) => target.pos.getRangeTo(s));
  return sortedByDistance[0];
};
