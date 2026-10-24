import { it, expect } from 'vitest';
import {
  keyInfo,
  lessonPassed,
  lessonRules,
  makeText,
  isSpeedPractice,
  type Session,
} from './engine';
import { lessonText, lessons } from './curriculum';
import { symbols, symbolPatterns } from './symbols';
it('čísla, znaky a Excel nevyžadují rychlost ani časový limit', () => {
  for (const lesson of [26, 27, 28, 29, 30, 31, 33]) {
    expect(lessonRules(lesson)).toMatchObject({ minCpm: 0, timeLimit: null });
    const session: Session = {
      id: 'precision',
      date: '2026-10-24T12:00:00Z',
      mode: 'beginner',
      lesson,
      lessonVersion: 2,
      finished: true,
      characters: 150,
      seconds: 1800,
      cpm: 5,
      accuracy: 98,
      errors: 3,
      device: 'notebook',
    };
    expect(lessonPassed(session)).toBe(true);
    expect(lessonPassed({ ...session, errors: 4 })).toBe(false);
  }
  expect(lessonRules(0)).toMatchObject({ minCpm: 150, timeLimit: 180 });
  expect(isSpeedPractice({ mode: 'beginner', lesson: 30 })).toBe(false);
  expect(isSpeedPractice({ mode: 'symbols', lesson: 0 })).toBe(false);
  expect(isSpeedPractice({ mode: 'beginner', lesson: 0 })).toBe(true);
});
it('všechny požadované znaky najdou klávesu v základním bloku', () => {
  for (const symbol of symbols) {
    expect(keyInfo(symbol.char)?.code).toBe(symbol.code);
    expect(keyInfo(symbol.char)?.code).not.toMatch(/Numpad|Arrow|Insert|Delete|Page/);
    if (symbol.combo.startsWith('Ctrl + Alt')) expect(keyInfo(symbol.char)?.alt).toBe(true);
  }
  for (const char of '<>&/*()+-"') expect(symbolPatterns.join(' ')).toContain(char);
});
it('vzorce používají anglické funkce a výběr znaku se skutečně zaměří na něj', () => {
  const corpus = [
    ...lessons.map((_, i) => lessonText(i, 0)),
    ...symbolPatterns,
    makeText('symbols', 0, {}),
  ].join(' ');
  expect(corpus).not.toContain('SUMA');
  expect(corpus).toContain('SUM(');
  expect(corpus).toContain('IF(');
  expect(makeText('symbols', 0, {}, 0, '', '&')).toContain('&');
});
