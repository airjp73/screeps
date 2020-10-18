import { harvest, withdraw } from "./actions";
import { getClosest, getCreepTarget } from "./targetAquireing";

const getSourceContainer = (source: Source) => {
  const containers =
    source.room.find(FIND_STRUCTURES, {
      filter: (structure) => structure.structureType === STRUCTURE_CONTAINER,
    }) ?? [];
  return getClosest(containers, source);
};

export const getEnergyFromSource = (creep: Creep, source: Source): void => {
  const targetHasStaticHarvester = Object.values(
    Memory.harvesterSources ?? {}
  ).includes(creep.memory.target as Id<Source>);

  if (targetHasStaticHarvester) {
    const target = getSourceContainer(source);
    withdraw(creep, target, () => creep.withdraw(target, RESOURCE_ENERGY));
  } else {
    harvest(creep, source, () => creep.harvest(source));
  }
};

/**
 * Used by non-harvesters to collect the energy they need to perform their duty.
 */
export const getEnergy = (creep: Creep): void => {
  const sources = creep.room.find(FIND_SOURCES);
  const target = getCreepTarget(creep);
  if (target) {
    const closestSourceToTarget = getClosest(sources, target);
    getEnergyFromSource(creep, closestSourceToTarget);
  }
};
