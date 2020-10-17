export type MoveResultCode =
  | CreepMoveReturnCode
  | ERR_NO_PATH
  | ERR_INVALID_TARGET
  | ERR_NOT_FOUND;

export type MoveResult = { resultType: "move"; code: MoveResultCode };
export type ActionResult<T> = { resultType: "action-performed"; code: T };
export type PerformResult<T> = MoveResult | ActionResult<T>;

export type MoveFunc = (creep: Creep, struct: RoomObject) => MoveResultCode;

export const doOrMove = (move: MoveFunc) => <T extends number>(
  creep: Creep,
  target: RoomObject,
  action: () => T
): PerformResult<T> => {
  const actionResult = action();
  if (actionResult === ERR_NOT_IN_RANGE) {
    const moveResult = move(creep, target);
    return { resultType: "move", code: moveResult };
  }
  return { resultType: "action-performed", code: actionResult };
};

export const attack = doOrMove((creep, struct) =>
  creep.moveTo(struct, { visualizePathStyle: { stroke: "#ff0000" } })
);

export const withdraw = doOrMove((creep, struct) =>
  creep.moveTo(struct, { visualizePathStyle: { stroke: "#0000ff" } })
);

export const harvest = doOrMove((creep, struct) =>
  creep.moveTo(struct, { visualizePathStyle: { stroke: "#ffaa00" } })
);

export const transfer = doOrMove((creep, struct) =>
  creep.moveTo(struct, { visualizePathStyle: { stroke: "#aaff00" } })
);

export const build = doOrMove((creep, struct) =>
  creep.moveTo(struct, { visualizePathStyle: { stroke: "#ffffff" } })
);

export const repair = doOrMove((creep, struct) =>
  creep.moveTo(struct, { visualizePathStyle: { stroke: "#ff9999" } })
);
