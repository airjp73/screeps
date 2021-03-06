import { builder } from "roles/builder";
import { harvester } from "roles/harvester";
import { soldier } from "roles/soldier";
import { repairer } from "roles/repairer";
import { upgrader } from "roles/upgrader";
import { forEachCreep } from "utils/forEachCreep";
import { CreepRoleDefinition } from "roles/creepStateMachine";
import { staticHarvester } from "roles/staticHarvester";

// const targetCreepCounts = {
//   // Starting Phase
//   harvester: 4,
//   upgrader: 3,
//   builder: 4,
//   soldier: 0,
//   repairer: 2,

//   // Static harvesting phase
//   staticHarvester: 2,
//   energyRunner: 0,
// };

const showStatusText = (obj: RoomObject, text: string) => {
  obj.room?.visual.text(text, obj.pos.x + 1, obj.pos.y, {
    align: "left",
    opacity: 0.8,
  });
};

export const checkCreepCounts = (): void => {
  // TODO: Support multiple spawners?
  const spawner = Game.spawns["Spawn1"];
  if (spawner.spawning) {
    const spawningCreep = Game.creeps[spawner.spawning.name];
    showStatusText(spawner, `🛠 Spawning ${spawningCreep.memory.role}`);
    return;
  }

  const roleCounts: { [role in CreepRole]?: number } = {};
  forEachCreep((creep) => {
    const currentCount = roleCounts[creep.memory.role] ?? 0;
    roleCounts[creep.memory.role] = currentCount + 1;
  });

  const numExtensions = spawner.room.find(FIND_STRUCTURES, {
    filter: (struct) => struct.structureType === STRUCTURE_EXTENSION,
  }).length;

  const spawn = (role: CreepRoleDefinition) =>
    role.spawn(spawner, roleCounts, numExtensions);

  spawn(harvester) ||
    spawn(upgrader) ||
    spawn(staticHarvester) ||
    spawn(repairer) ||
    spawn(builder) ||
    spawn(soldier);

  // let creepSpawned = false;
  // const needCreepOftype = (role: CreepRoleDefinition, targetCount: number) => {
  //   const numNeeded = targetCount - (roleCounts[role.role] ?? 0);
  //   if (!creepSpawned && numNeeded > 0) {
  //     role.spawn(spawner);
  //     creepSpawned = true;
  //   }
  // };

  // needCreepOftype(harvester, targetCreepCounts.harvester);
  // needCreepOftype(upgrader, targetCreepCounts.upgrader);
  // needCreepOftype(repairer, targetCreepCounts.repairer);
  // needCreepOftype(builder, targetCreepCounts.builder);

  // if (Memory.phase >= GamePhase.SETUP_STATIC_HARVESTING) {
  //   needCreepOftype(staticHarvester, targetCreepCounts.staticHarvester);
  // }

  // needCreepOftype(soldier, targetCreepCounts.soldier);

  // harvester.spawn(spawner, roleCounts)

  // if (Memory.phase >= GamePhase.ACTIVE_STATIC_HARVESTING) {
  //   needCreepOftype(energyRunner, targetCreepCounts.energyRunner);
  // }
};
