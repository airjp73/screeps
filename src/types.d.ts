type CreepRole = "harvester" | "upgrader" | "builder" | "soldier";

interface CreepMemory {
  role: CreepRole;
  room: string;
  state: string;
}

interface Memory {
  uuid: number;
  targetCreepCounts?: { [role in CreepRole]: number };
}
