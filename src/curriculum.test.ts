import { describe, it, expect } from 'vitest';
import {
  lessons,
  learnedChars,
  lessonText,
  exerciseOrder,
  COURSE_VERSION,
  textSignature,
  lessonRules,
  lessonPool,
} from './curriculum';
import {
  freshProgress,
  addSession,
  exercisePassed,
  mergeProgress,
  parseProgress,
  isSpeedPractice,
  type Session,
} from './engine';
import { courseSections, sectionText, sectionParts } from './assessment';

const sample = (exercise: Session['exercise'], patch: Partial<Session> = {}): Session => ({
  id: String(exercise),
  date: '2026-10-25T08:00:00Z',
  mode: 'beginner',
  lesson: 0,
  lessonId: lessons[0].id,
  lessonVersion: COURSE_VERSION,
  exercise,
  device: 'notebook',
  characters: 150,
  seconds: 60,
  cpm: 150,
  accuracy: 100,
  errors: 3,
  keyStats: {},
  finished: true,
  ...patch,
});
describe('nový výukový kurz', () => {
  it('učí prostřední, horní a dolní řadu odděleně a potom diakritiku', () => {
    expect(courseSections.slice(0, 4).map((s) => s.title)).toEqual([
      'Prostřední řada',
      'Horní řada',
      'Dolní řada',
      'Diakritika',
    ]);
    const rows = ['asdfghjklů', 'qwertzuiopú', 'yxcvbnm'];
    courseSections.slice(0, 3).forEach((section, row) => {
      const chars = lessons
        .slice(section.from, section.to + 1)
        .map((l) => l.keys)
        .join('');
      expect([...chars].sort()).toEqual([...rows[row]].sort());
    });
  });
  it.each([
    [0, 25],
    [25, 46],
    [46, 67],
  ])(
    'lekce %i–%i mají nejvýše dva nové znaky a používají jen naučené znaky',
    (from, to) => {
      const seen = new Set<string>(learnedChars(from - 1));
      for (let index = from; index < to; index++) {
        const lesson = lessons[index];
        expect([...lesson.keys].length).toBeLessThanOrEqual(2);
        for (const c of lesson.keys) {
          expect(seen.has(c), `${lesson.id}: ${c} už byl zaveden`).toBe(false);
          seen.add(c);
        }
        for (const exercise of exerciseOrder)
          for (const variant of [0, 1, 9]) {
            const text = lessonText(index, variant, ['j', 'ř'], '', exercise);
            expect(text.length).toBeGreaterThanOrEqual(exercise === 'touch' ? 24 : 100);
            const unknown = [...new Set(text)].filter((c) => !seen.has(c));
            expect(unknown, `${lesson.id}/${exercise}: neznámé znaky`).toEqual([]);
            for (const c of lesson.keys)
              expect(text, `${lesson.id}/${exercise}: chybí nový znak ${c}`).toContain(c);
            expect(lessonText(index, variant, ['j', 'ř'], textSignature(text), exercise)).not.toBe(
              text,
            );
          }
      }
    },
    15000,
  );
  it('po izolovaném osahání vrací všechny předchozí klávesy a od prvních slov už nepoužívá náhodné skupiny', () => {
    for (let index = 0; index < 25; index++) {
      for (const exercise of ['words', 'sentences'] as const) {
        for (const variant of [0, 1, 9]) {
          const text = lessonText(index, variant, ['j'], '', exercise);
          for (const char of learnedChars(index))
            expect(text, `${lessons[index].id}/${exercise}: chybí známý znak ${char}`).toContain(
              char,
            );
          expect(text.length).toBeLessThanOrEqual(380);
          if (index >= 3 && exercise === 'words') {
            const vocabulary = lessonPool(index, 'words');
            for (const word of text.split(' ')) expect(vocabulary).toContain(word);
          }
        }
      }
    }
    // Introducing D/K does not contaminate their initial two-key warmup.
    expect([...lessonText(1, 0, [], '', 'touch')].every((c) => 'dk '.includes(c))).toBe(true);
    expect(lessonText(3, 0, [], '', 'words')).toContain('fajfka');
    const firstSentences = lessonText(6, 0, [], '', 'sentences');
    expect(firstSentences).toMatch(/hala je sklad|kde je les|jak se jde/);
    const capitalTransition = lessonPool(37, 'sentences').join(' ');
    expect(capitalTransition).toContain('dům');
    expect(capitalTransition).not.toMatch(/DůM|LOď|TICHé/);
  });
  it('obě navazující cvičení vracejí dostupné předchozí hmaty i u velkých písmen, čísel a symbolů', () => {
    for (let index = 25; index < lessons.length; index++) {
      if (!lessons[index].keys) continue;
      const vocabulary = [...lessonPool(index, 'words'), ...lessonPool(index)]
        .join(' ')
        .toLocaleLowerCase('cs');
      const known = [...new Set(learnedChars(index).toLocaleLowerCase('cs'))].filter((c) =>
        vocabulary.includes(c),
      );
      for (const variant of [0, 1, 9]) {
        const text = (
          lessonText(index, variant, [], '', 'words') +
          ' ' +
          lessonText(index, variant, [], '', 'sentences')
        ).toLocaleLowerCase('cs');
        expect(
          known.filter((c) => !text.includes(c)),
          lessons[index].id,
        ).toEqual([]);
      }
    }
  });
  it('souhrnný test používá jen znaky naučené v příslušné sekci', () => {
    courseSections.forEach((section, index) =>
      sectionParts(index).forEach((_, part) => {
        const text = sectionText(index, part, 1);
        expect(text.length).toBeLessThanOrEqual(450);
        for (const c of text) expect(learnedChars(section.to)).toContain(c);
      }),
    );
  });
  it('osahání nemá rychlostní limit a samotné jedno cvičení neodemkne další lekci', () => {
    let p = addSession(freshProgress(), sample('touch', { characters: 44, seconds: 600, cpm: 4 }));
    expect(exercisePassed(p.sessions, 0, 'touch')).toBe(true);
    expect(p.completed).toEqual([]);
    p = addSession(p, sample('words'));
    expect(p.completed).toEqual([]);
    p = addSession(p, sample('sentences', { errors: 4 }));
    expect(p.completed).toEqual([]);
    p = addSession(p, sample('sentences', { id: 'passed', errors: 3 }));
    expect(p.completed).toEqual([0]);
    expect(isSpeedPractice(p.sessions.find((s) => s.exercise === 'touch')!)).toBe(false);
    expect(lessonRules(0, 'touch').minCpm).toBe(0);
  });
  it('dokončení tří kroků se sloučí mezi zařízeními a po obnovení se neztratí', () => {
    const a = addSession(freshProgress(), sample('touch'));
    let b = addSession(freshProgress(), sample('words'));
    b = addSession(b, sample('sentences'));
    const merged = mergeProgress(a, parseProgress(JSON.stringify(b)));
    expect(merged.completed).toEqual([0]);
    expect(parseProgress(JSON.stringify(merged))).toEqual(merged);
  });
  it('starý pokrok přemapuje podle skutečných znaků, nikoliv podle nových čísel lekcí', () => {
    const old = JSON.stringify({
      ...freshProgress(),
      version: 2,
      completed: [19],
      sessions: [sample('sentences', { lesson: 19, lessonVersion: 2, lessonId: undefined })],
    });
    const p = parseProgress(old);
    expect(p.version).toBe(3);
    expect(p.legacyCompleted).toEqual([19]);
    expect(p.completed).toContain(lessons.findIndex((l) => l.id === 'czech-ai'));
    expect(p.completed).not.toContain(19);
    expect(p.sessions[0].lessonVersion).toBe(2);
    expect(parseProgress(JSON.stringify(p))).toEqual(p);
    expect(isSpeedPractice(sample(undefined, { lesson: 30, lessonVersion: 2 }))).toBe(false);
  });
});
