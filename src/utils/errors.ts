export class UnreachableCaseError extends Error {
  constructor(param: never) {
    super(`Should not be able to reach case: ${param}`);
  }
}
