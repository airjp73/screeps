type CreepRole = "harvester" | "upgrader" | "builder" | "soldier" | "repairer";

interface CreepMemory {
  role: CreepRole;
  room: string;
  state: string;
  target?: string;
}

interface Memory {
  uuid: number;
  targetCreepCounts?: { [role in CreepRole]: number };
}
