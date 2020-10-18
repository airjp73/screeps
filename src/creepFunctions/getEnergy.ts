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

export const getDroppedEnergyIfPresent = (creep: Creep): boolean => {
  const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
    filter: (resource) => resource.resourceType === RESOURCE_ENERGY,
  });
  if (droppedEnergy.length) {
    harvest(creep, droppedEnergy[0], () => creep.pickup(droppedEnergy[0]));
    return true;
  }
  return false;
};
/**
 * Used by non-harvesters to collect the energy they need to perform their duty.
 */
export const getEnergy = (creep: Creep): void => {
  if (getDroppedEnergyIfPresent(creep)) return;
  const sources = creep.room.find(FIND_SOURCES);
  const target = getCreepTarget(creep);
  if (target) {
    const closestSourceToTarget = getClosest(sources, target);
    getEnergyFromSource(creep, closestSourceToTarget);
  }
};
