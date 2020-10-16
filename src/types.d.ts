type CreepRole = "harvester";

interface CreepMemory {
  role: CreepRole;
  room: string;
  working: boolean;
  state: string;
}

interface Memory {
  uuid: number;
  numHarvesters: number;
}
