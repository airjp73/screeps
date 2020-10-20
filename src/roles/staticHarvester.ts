import { harvest } from "creepFunctions/actions";
import { getClosestContainer } from "creepFunctions/getEnergy";
import { GamePhase } from "enums";
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

const level2Parts = [WORK, WORK, WORK, WORK, WORK, MOVE];
const level3Parts = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE];
const level4Parts = [
  WORK,
  WORK,
  WORK,
  WORK,
  WORK,
  WORK,
  WORK,
  WORK,
  WORK,
  TOUGH,
  MOVE,
  MOVE,
];
export const staticHarvester: CreepRoleDefinition = {
  role: "staticHarvester",
  run: runCreepStateMachine(states),
  spawn: (spawner, roleCounts, numExtensions) => {
    if (Memory.phase < GamePhase.SETUP_STATIC_HARVESTING) return false;
    const sources = spawner.room.find(FIND_SOURCES, {
      filter: (source) =>
        !Object.values(Memory.harvesterSources ?? {}).includes(source.id),
    });
    if (!sources.length) return false;

    const target = sources[0];
    const name = _.uniqueId();
    const getParts = () => {
      if (numExtensions < 10) return level2Parts;
      if (numExtensions < 15) return level3Parts;
      return level4Parts;
    };
    const result = spawner.spawnCreep(getParts(), name, {
      memory: {
        role: "staticHarvester",
        room: spawner.room.name,
        state: "harvesting",
        target: target.id,
      },
    });
    if (result === OK) {
      Memory.harvesterSources = Memory.harvesterSources ?? {};
      Memory.harvesterSources[name] = target.id;
    }
    return true;
  },
};
