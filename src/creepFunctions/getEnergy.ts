import { harvest, withdraw } from "./actions";
import { getClosest, getCreepTarget } from "./targetAquireing";

export const getClosestContainer = (source: RoomObject): StructureContainer => {
  const containers =
    source.room?.find<StructureContainer>(FIND_STRUCTURES, {
      filter: (structure) => structure.structureType === STRUCTURE_CONTAINER,
    }) ?? [];
  return getClosest(containers, source);
};

export const getEnergyFromSource = (creep: Creep, source: Source): void => {
  const targetHasStaticHarvester = Object.values(
    Memory.harvesterSources ?? {}
  ).includes(creep.memory.target as Id<Source>);

  // When static harvester is active only grab from container
  if (targetHasStaticHarvester) {
    const target = getClosestContainer(source);
    withdraw(creep, target, () => creep.withdraw(target, RESOURCE_ENERGY));
    return;
  }

  // If no harvester but container has energy
  const container = getClosestContainer(source);
  if (
    container.pos.inRangeTo(source.pos, 4) &&
    container.store.getUsedCapacity() > 0
  ) {
    withdraw(creep, container, () =>
      creep.withdraw(container, RESOURCE_ENERGY)
    );
    return;
  }

  // Otherwise harvest from a source
  harvest(creep, source, () => creep.harvest(source));
};

export const getDroppedEnergyIfPresent = (creep: Creep): boolean => {
  const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
    filter: (resource) => resource.resourceType === RESOURCE_ENERGY,
  });
  if (droppedEnergy.length) {
    const target = getCreepTarget(creep);
    const energy = target
      ? getClosest(droppedEnergy, target)
      : droppedEnergy[0];
    harvest(creep, energy, () => creep.pickup(energy));
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
