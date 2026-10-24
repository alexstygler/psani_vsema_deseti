import {
  lessonPool,
  lessonText,
  lessonRules,
  textSignature,
  lessons,
  PASS_CPM,
  MAX_ERRORS,
} from './curriculum';

export type Assessment = { kind: 'exam' } | { kind: 'placement'; stage: number };
export const placementStages = [
  { title: 'Základní poloha a první slova', from: 0, to: 5 },
  { title: 'Celá abeceda bez diakritiky', from: 6, to: 15 },
  { title: 'Česká písmena a plynulost', from: 16, to: 22 },
  { title: 'Velká písmena a interpunkce', from: 23, to: 25 },
  { title: 'Čísla, znaky a Excel', from: 26, to: 31 },
  { title: 'Akademický text', from: 32, to: 32 },
  { title: 'Citace a poznámky', from: 33, to: 33 },
  { title: 'Jistota v běžném psaní', from: 34, to: 35 },
];

export function stageLessons(stage: number) {
  const range = placementStages[stage];
  return range ? Array.from({ length: range.to - range.from + 1 }, (_, i) => range.from + i) : [];
}

export function recommendedStage(completed: number[]) {
  return placementStages.findIndex((_, stage) =>
    stageLessons(stage).some((i) => !completed.includes(i)),
  );
}

export function assessmentRules(assessment: Assessment | undefined, lesson: number) {
  if (assessment?.kind !== 'placement') return lessonRules(lesson);
  const covered = stageLessons(assessment.stage);
  // A stage containing only precision lessons never introduces a speed requirement.
  const minCpm = covered.some((i) => lessonRules(i).minCpm > 0) ? PASS_CPM : 0;
  return { minCpm, maxErrors: MAX_ERRORS, timeLimit: minCpm ? 180 : null };
}

export function placementText(stage: number, variant: number, avoid = '') {
  const covered = stageLessons(stage);
  if (!covered.length) throw new Error('Neplatná část rozřazení.');
  // Every credited lesson contributes an actual phrase; a prose test cannot
  // silently certify Excel or a key that was never included in the sample.
  for (let retry = 0; retry < 40; retry++) {
    const parts = covered.map((index, offset) => {
      const pool = lessonPool(index);
      const choice = Math.abs(variant + retry + offset) % pool.length;
      const first = pool[choice];
      let sample = first.length < 12 ? `${first} ${pool[(choice + 1) % pool.length]}` : first;
      if (index < 23)
        for (const key of lessons[index].keys) {
          if (sample.includes(key)) continue;
          const word = [...pool, ...lessons[index].words].find((part) => part.includes(key));
          sample += ` ${word ?? key}`;
        }
      return sample;
    });
    let text = parts.join(' ');
    if (text.length < 115) text += ` ${lessonText(covered.at(-1)!, variant + retry)}`;
    if (textSignature(text) !== avoid || retry === 39) return text;
  }
  return '';
}
