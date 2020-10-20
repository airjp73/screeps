export type StateChangeAction = Partial<CreepMemory> & {
  type: "change-state";
};
export type CreepStateDefinition = {
  check: (creep: Creep) => string | StateChangeAction | undefined;
  perform: (creep: Creep) => void;
};
export type CreepRoleDefinition = {
  role: CreepRole;
  run: (creep: Creep) => void;
  spawn: (
    spawner: StructureSpawn,
    roleCounts: { [role in CreepRole]?: number },
    numExtensions: number
  ) => boolean;
};
export type CreepStateMachine = { [state: string]: CreepStateDefinition };

export const setCreepState = (
  newState: Partial<CreepMemory>
): StateChangeAction => ({
  ...newState,
  type: "change-state",
});

export const runCreepStateMachine = (machine: CreepStateMachine) => (
  creep: Creep
): void => {
  const changedState = machine[creep.memory.state].check(creep);
  if (typeof changedState === "string") {
    creep.memory.state = changedState;
  } else if (changedState?.type === "change-state") {
    creep.memory = {
      ...creep.memory,
      ...changedState,
    };
  }
  machine[creep.memory.state].perform(creep);
};
