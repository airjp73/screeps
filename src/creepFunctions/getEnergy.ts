import { GamePhase } from "enums";
import { harvest, withdraw } from "./actions";
import { getClosest, getCreepTarget } from "./targetAquireing";

const harvestEnergy = (creep: Creep) => {
  const sources = creep.room.find(FIND_SOURCES);
  const target = getCreepTarget(creep);
  if (target) {
    const closestSourceToTarget = getClosest(sources, target);
    harvest(creep, closestSourceToTarget, () =>
      creep.harvest(closestSourceToTarget)
    );
  }
};

const getEnergyFromContainer = (creep: Creep) => {
  const containers = creep.room.find(FIND_STRUCTURES, {
    filter: (structure) => structure.structureType === STRUCTURE_CONTAINER,
  });
  const target = getCreepTarget(creep);
  if (target) {
    const closestContainerToTarget = getClosest(containers, target);
    withdraw(creep, closestContainerToTarget, () =>
      creep.withdraw(closestContainerToTarget, RESOURCE_ENERGY)
    );
  }
};

/**
 * Used by non-harvesters to collect the energy they need to perform their duty.
 */
export const getEnergy = (creep: Creep): void => {
  const phase = Memory.phase ?? 0;
  if (phase < GamePhase.STATIC_HARVESTING) {
    harvestEnergy(creep);
  } else {
    getEnergyFromContainer(creep);
  }
};
