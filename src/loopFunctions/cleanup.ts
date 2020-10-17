export const cleanup = (): void => {
  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  for (const name in Memory.harvesterSources) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
};
