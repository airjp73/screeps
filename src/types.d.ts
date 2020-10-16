type CreepRole = "harvester" | "upgrader";

interface CreepMemory {
  role: CreepRole;
  room: string;
  working: boolean;
  state: string;
}

interface Memory {
  uuid: number;
  numHarvesters: number;
  numUpgraders: number;
}
