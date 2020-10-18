import { builder } from "roles/builder";
import { harvester } from "roles/harvester";
import { soldier } from "roles/soldier";
import { repairer } from "roles/repairer";
import { upgrader } from "roles/upgrader";
import { forEachCreep } from "utils/forEachCreep";
import { CreepRoleDefinition } from "roles/creepStateMachine";
import { staticHarvester } from "roles/staticHarvester";
import { GamePhase } from "enums";

const targetCreepCounts = {
  // Starting Phase
  harvester: 4,
  upgrader: 1,
  builder: 4,
  soldier: 0,
  repairer: 2,

  // Static harvesting phase
  staticHarvester: 2,
  energyRunner: 0,
};

const showStatusText = (obj: RoomObject, text: string) => {
  obj.room?.visual.text(text, obj.pos.x + 1, obj.pos.y, {
    align: "left",
    opacity: 0.8,
  });
};

export const checkCreepCounts = (): void => {
  const roleCounts: { [role: string]: number } = {};
  forEachCreep((creep) => {
    const currentCount = roleCounts[creep.memory.role] ?? 0;
    roleCounts[creep.memory.role] = currentCount + 1;
  });

  // TODO: Support multiple spawners?
  const spawner = Game.spawns["Spawn1"];
  if (spawner.spawning) {
    const spawningCreep = Game.creeps[spawner.spawning.name];
    showStatusText(spawner, `🛠 Spawning ${spawningCreep.memory.role}`);
    return;
  }

  let creepSpawned = false;
  const needCreepOftype = (role: CreepRoleDefinition, targetCount: number) => {
    const numNeeded = targetCount - (roleCounts[role.role] ?? 0);
    if (!creepSpawned && numNeeded > 0) {
      role.spawn(spawner);
      creepSpawned = true;
    }
  };

  needCreepOftype(harvester, targetCreepCounts.harvester);
  needCreepOftype(upgrader, targetCreepCounts.upgrader);
  needCreepOftype(repairer, targetCreepCounts.repairer);
  needCreepOftype(builder, targetCreepCounts.builder);

  if (Memory.phase >= GamePhase.SETUP_STATIC_HARVESTING) {
    needCreepOftype(staticHarvester, targetCreepCounts.staticHarvester);
  }

  needCreepOftype(soldier, targetCreepCounts.soldier);

  // if (Memory.phase >= GamePhase.ACTIVE_STATIC_HARVESTING) {
  //   needCreepOftype(energyRunner, targetCreepCounts.energyRunner);
  // }
};
