import { it, expect } from 'vitest';
import { insertCharacter, deleteBackward, type CorrectionState } from './typing';
it('pokračující chybný úsek je jedna chyba a musí celý pryč', () => {
  let state: CorrectionState = { index: 0, error: '', errors: 0 };
  for (const char of 'xabcde') state = insertCharacter(state, char, 'a');
  expect(state).toMatchObject({ index: 0, error: 'xabcde', errors: 1 });
  for (let i = 0; i < 5; i++) state = deleteBackward(state);
  expect(state.error).toBe('x');
  state = insertCharacter(state, 'a', 'a');
  expect(state).toMatchObject({ index: 0, error: 'xa', errors: 1 });
  state = deleteBackward(deleteBackward(state));
  state = insertCharacter(state, 'a', 'a');
  expect(state).toMatchObject({ index: 1, error: '', errors: 1 });
  state = insertCharacter(state, 'z', 'b');
  expect(state.errors).toBe(2);
});
it('smazání správného znaku není chyba a nesnižuje historický počet chyb', () => {
  expect(deleteBackward({ index: 2, error: '', errors: 3 })).toEqual({
    index: 1,
    error: '',
    errors: 3,
  });
  expect(deleteBackward({ index: 0, error: '', errors: 0 }).index).toBe(0);
});
