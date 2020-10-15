export const forEachCreep = (func: (item: Creep) => void): void => {
  Object.values(Game.creeps).forEach((creep) => func(creep));
};
