import { describe, expect, it } from 'vitest';
import {
  placementStages,
  placementText,
  stageLessons,
  recommendedStage,
  courseSections,
  sectionParts,
  sectionLessons,
  sectionText,
} from './assessment';
import { lessonText, lessons, textSignature, COURSE_VERSION } from './curriculum';
import {
  freshProgress,
  addSession,
  lessonPassed,
  nextLesson,
  mergeProgress,
  parseProgress,
  sectionPartPassed,
  type Session,
} from './engine';

const attempt = (patch: Partial<Session> = {}): Session => ({
  id: 'placement',
  date: '2026-10-24T12:00:00Z',
  cpm: 150,
  accuracy: 98,
  seconds: 60,
  characters: 150,
  mode: 'beginner',
  lesson: 5,
  lessonVersion: COURSE_VERSION,
  finished: true,
  errors: 3,
  device: 'notebook',
  assessment: { kind: 'placement', stage: 0 },
  ...patch,
});

describe('rozřazení a závěrečné testy', () => {
  it('při hraničním úspěchu uzná jen skutečně testovanou oblast a přenese ji do druhého zařízení', () => {
    const a = addSession(freshProgress(), attempt());
    expect(a.completed).toEqual([0, 1, 2, 3, 4, 5]);
    const transferred = mergeProgress(freshProgress(), parseProgress(JSON.stringify(a)));
    expect(transferred.completed).toEqual(a.completed);
    expect(recommendedStage(transferred.completed)).toBe(1);
    expect(transferred.sessions[0].assessment).toEqual({ kind: 'placement', stage: 0 });
  });
  it('neúspěšné, krátké, nedokončené a nesprávně označené testy nic neodemknou', () => {
    for (const patch of [
      { errors: 4 },
      { seconds: 60.01 },
      { finished: false },
      { characters: 99 },
      { lesson: 6 },
      { lessonVersion: 1 },
    ]) {
      const p = addSession(freshProgress(), attempt(patch));
      expect(p.completed).toEqual([]);
    }
    const passed = addSession(freshProgress(), attempt());
    expect(addSession(passed, attempt({ id: 'failed', errors: 10 })).completed).toEqual(
      passed.completed,
    );
  });
  it('znaky, Excel a citace splní i velmi pomalý člověk; akademický text vyžaduje 150 CPM', () => {
    for (const stage of [6, 7, 8, 9]) {
      const s = attempt({
        lesson: placementStages[stage].to,
        assessment: { kind: 'placement', stage },
        seconds: 1200,
      });
      expect(lessonPassed(s)).toBe(true);
      expect(addSession(freshProgress(), s).completed).toEqual(stageLessons(stage));
    }
    expect(
      lessonPassed(
        attempt({
          lesson: placementStages[10].to,
          assessment: { kind: 'placement', stage: 10 },
          seconds: 61,
        }),
      ),
    ).toBe(false);
  });
  it('samostatný závěrečný test uzná jen vybranou lekci, nikoliv celý předchozí kurz', () => {
    expect(
      addSession(freshProgress(), attempt({ lesson: 20, assessment: { kind: 'exam' } })).completed,
    ).toEqual([20]);
    expect(nextLesson([20])).toBe(21);
    expect(nextLesson([])).toBe(0);
    expect(nextLesson(lessons.map((_, i) => i))).toBe(lessons.length - 1);
  });
  it('rozřazení pokrývá všechny lekce a skutečně obsahuje jejich nové základní klávesy', () => {
    expect(placementStages.flatMap((_, i) => stageLessons(i))).toEqual(lessons.map((_, i) => i));
    placementStages.forEach((stage, i) => {
      const text = placementText(i, 0);
      expect(text.length).toBeGreaterThanOrEqual(115);
      expect(text.length).toBeLessThanOrEqual(450);
      for (const index of stageLessons(i).filter((n) => n < 23))
        for (const char of lessons[index].keys) expect(text).toContain(char);
      expect(placementText(i, 0, textSignature(text))).not.toBe(text);
      expect(stage.to).toBeGreaterThanOrEqual(stage.from);
    });
    expect(recommendedStage(lessons.map((_, i) => i))).toBe(-1);
  });
  it('opakování vynechá předchozí text i při stejném seedu a změně slabých kláves', () => {
    lessons.forEach((_, index) => {
      let previous = '';
      for (let variant = 0; variant < 10; variant++) {
        const text = lessonText(
          index,
          variant % 2,
          variant % 3 ? ['a', 'j', 'ř'] : [],
          textSignature(previous),
        );
        expect(text).not.toBe(previous);
        previous = text;
      }
    });
  });
  it('sekce odpovídají řadám a postupným kapitolám, první test uzná lekce 1–6', () => {
    expect(courseSections.map((s) => [s.from, s.to])).toEqual([
      [0, 5],
      [6, 11],
      [12, 16],
      [17, 24],
      [25, 37],
      [38, 45],
      [46, 48],
      [49, 53],
      [54, 62],
      [63, 64],
      [65, 66],
    ]);
    const p = addSession(
      freshProgress(),
      attempt({ assessment: { kind: 'section', section: 0, part: 0 } }),
    );
    expect(p.completed).toEqual([0, 1, 2, 3, 4, 5]);
    expect(sectionPartPassed(p.sessions, 0, 0)).toBe(true);
    for (const patch of [{ errors: 4 }, { seconds: 61 }, { lesson: 4 }, { finished: false }])
      expect(
        addSession(
          freshProgress(),
          attempt({ assessment: { kind: 'section', section: 0, part: 0 }, ...patch }),
        ).completed,
      ).toEqual([]);
  });
  it('Excel a znaménka nemají rychlostní limit, ale závěrečný český text ho má', () => {
    for (const section of [6, 7, 8, 9]) {
      expect(sectionParts(section)).toHaveLength(1);
      const session = attempt({
        lesson: courseSections[section].to,
        assessment: { kind: 'section', section, part: 0 },
        seconds: 1200,
      });
      expect(lessonPassed(session)).toBe(true);
      expect(addSession(freshProgress(), session).completed).toEqual(sectionLessons(section));
      const b = parseProgress(JSON.stringify(addSession(freshProgress(), session)));
      expect(mergeProgress(freshProgress(), b).completed).toEqual(sectionLessons(section));
    }
    const slow = attempt({
      lesson: courseSections[10].to,
      assessment: { kind: 'section', section: 10, part: 0 },
      seconds: 1200,
    });
    expect(addSession(freshProgress(), slow).completed).toEqual([]);
  });
  it('souhrn každé sekce pokryje její lekce a obmění zadání při opakování', () => {
    courseSections.forEach((_, section) => {
      expect(
        sectionParts(section)
          .flatMap((p) => p.lessons)
          .sort((a, b) => a - b),
      ).toEqual(sectionLessons(section));
      sectionParts(section).forEach((_, part) => {
        const text = sectionText(section, part, 0);
        expect(text.length).toBeGreaterThanOrEqual(115);
        expect(text.length).toBeLessThanOrEqual(450);
        expect(sectionText(section, part, 0, textSignature(text))).not.toBe(text);
      });
    });
  });
});
