import { harvest } from "creepFunctions/actions";
import { getClosestContainer } from "creepFunctions/getEnergy";
import {
  CreepRoleDefinition,
  CreepStateMachine,
  runCreepStateMachine,
} from "./creepStateMachine";

const states: CreepStateMachine = {
  harvesting: {
    check: () => {
      // no-op; always in harvest mode
      return undefined;
    },
    perform: (creep: Creep) => {
      if (creep.memory.target) {
        const target = Game.getObjectById(creep.memory.target) as Source;
        const container = getClosestContainer(target);
        const notStandingOnContainer =
          container &&
          (container.pos.x !== creep.pos.x || container.pos.y !== creep.pos.y);
        if (notStandingOnContainer) {
          creep.moveTo(container.pos, {
            visualizePathStyle: { stroke: "#ffaa00" },
          });
        } else {
          harvest(creep, target, () => creep.harvest(target));
        }
      } else {
        Game.notify(`Creep ${creep.id} is missing a target`);
      }
    },
  },
};

export const staticHarvester: CreepRoleDefinition = {
  role: "staticHarvester",
  run: runCreepStateMachine(states),
  spawn: (spawner: StructureSpawn): void => {
    const sources = spawner.room.find(FIND_SOURCES, {
      filter: (source) =>
        !Object.values(Memory.harvesterSources ?? {}).includes(source.id),
    });
    const target = sources[0];
    const name = _.uniqueId();
    if (!target) {
      console.log("No target for static harvester");
    }
    if (target && sources.length) {
      const result = spawner.spawnCreep(
        [WORK, WORK, WORK, WORK, WORK, MOVE],
        name,
        {
          memory: {
            role: "staticHarvester",
            room: spawner.room.name,
            state: "harvesting",
            target: target.id,
          },
        }
      );
      if (result === OK) {
        Memory.harvesterSources = Memory.harvesterSources ?? {};
        Memory.harvesterSources[name] = target.id;
      }
    } else {
      Game.notify("Attempted to spawn static harvester with no free sources");
    }
  },
};
