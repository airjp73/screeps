type CreepRole =
  | "harvester"
  | "upgrader"
  | "builder"
  | "soldier"
  | "repairer"
  | "staticHarvester"
  | "energyRunner";

interface CreepMemory {
  role: CreepRole;
  room: string;
  state: string;
  target?: string;
}

declare enum GamePhase {
  INITIAL,
  STATIC_HARVESTING,
}

interface Memory {
  uuid: number;
  targetCreepCounts?: { [role in CreepRole]: number };
  harvesterSources: { [name: string]: Id<Source> };
  phase: GamePhase;
}
