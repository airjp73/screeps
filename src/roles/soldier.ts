import { attack } from "creepFunctions/actions";
import {
  CreepRoleDefinition,
  CreepStateMachine,
  runCreepStateMachine,
} from "./creepStateMachine";

const states: CreepStateMachine = {
  patrolling: {
    check: () => undefined,
    perform: (creep: Creep) => {
      const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
      attack(creep, hostiles[0], () => creep.attack(hostiles[0]));
    },
  },
};

export const soldier: CreepRoleDefinition = {
  role: "soldier",
  run: runCreepStateMachine(states),
  spawn: (spawner) => {
    spawner.spawnCreep([WORK, CARRY, MOVE], _.uniqueId(), {
      memory: {
        role: "soldier",
        room: spawner.room.name,
        state: "patrolling",
      },
    });
    return true;
  },
};
