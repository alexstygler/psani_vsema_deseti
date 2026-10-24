export type CorrectionState = { index: number; error: string; errors: number };
export function insertCharacter(state: CorrectionState, char: string, expected: string) {
  const accepted = !state.error && char === expected;
  const startsError = !state.error && !accepted;
  return {
    index: state.index + Number(accepted),
    error: accepted ? '' : state.error + char,
    errors: state.errors + Number(startsError),
    accepted,
    recordKey: !state.error,
  };
}
export function deleteBackward(state: CorrectionState): CorrectionState {
  return {
    index: state.error ? state.index : Math.max(0, state.index - 1),
    error: Array.from(state.error).slice(0, -1).join(''),
    errors: state.errors,
  };
}
