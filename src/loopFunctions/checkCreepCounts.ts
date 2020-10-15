import { harvester } from "roles/harvester";
import { UnreachableCaseError } from "utils/errors";
import { forEachCreep } from "utils/forEachCreep";

const setDefaultCounts = () => {
  Memory.numHarvesters = Memory.numHarvesters ?? 2;
};

const showStatusText = (obj: RoomObject, text: string) => {
  obj.room?.visual.text(text, obj.pos.x + 1, obj.pos.y, {
    align: "left",
    opacity: 0.8,
  });
};

export const checkCreepCounts = (): void => {
  setDefaultCounts();

  const roleCounts: { [role: string]: number } = {};
  forEachCreep((creep) => {
    const currentCount = roleCounts[creep.memory.role] ?? 0;
    roleCounts[creep.memory.role] = currentCount + 1;
  });

  const neededCreeps: CreepRole[] = [];
  const needCreepOftype = (role: CreepRole, targetCount: number) => {
    _.range(roleCounts[role] ?? 0, targetCount).forEach(() =>
      neededCreeps.push(role)
    );
  };

  needCreepOftype("harvester", Memory.numHarvesters);

  // TODO: Support multiple spawners?
  const spawn = Game.spawns["Spawn1"];
  if (spawn.spawning) {
    const spawningCreep = Game.creeps[spawn.spawning.name];
    showStatusText(spawn, `🛠 Spawning ${spawningCreep.memory.role}`);
  } else if (neededCreeps.length) {
    switch (neededCreeps[0]) {
      case "harvester":
        harvester.spawn(spawn);
        break;
      default:
        throw new UnreachableCaseError(neededCreeps[0]);
    }
  }
};
