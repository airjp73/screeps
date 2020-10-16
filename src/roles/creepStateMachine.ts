export type CreepStateDefinition = {
  check: (creep: Creep) => string | undefined;
  perform: (creep: Creep) => void;
};
export type CreepStateMachine = { [state: string]: CreepStateDefinition };

export const runCreepStateMachine = (machine: CreepStateMachine) => (
  creep: Creep
): void => {
  const changedState = machine[creep.memory.state].check(creep);
  if (changedState) creep.memory.state = changedState;
  machine[creep.memory.state].perform(creep);
};
