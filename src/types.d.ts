type CreepRole = "harvester";

interface CreepMemory {
  role: CreepRole;
  room: string;
  working: boolean;
}

interface Memory {
  uuid: number;
  numHarvesters: number;
}
