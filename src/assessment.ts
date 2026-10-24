import {
  lessonPool,
  lessonText,
  lessonRules,
  textSignature,
  lessons,
  PASS_CPM,
  MAX_ERRORS,
} from './curriculum';

export type Assessment =
  | { kind: 'exam' } // Legacy results remain valid; individual exams are no longer offered.
  | { kind: 'placement'; stage: number }
  | { kind: 'section'; section: number; part: number };

export const courseSections = lessons.reduce<Array<{ title: string; from: number; to: number }>>(
  (sections, l, index) => {
    const title = l.chapter.replace(/^\d+\s*·\s*/, '');
    const previous = sections.at(-1);
    if (previous?.title === title) previous.to = index;
    else sections.push({ title, from: index, to: index });
    return sections;
  },
  [],
);

export function sectionLessons(section: number) {
  const range = courseSections[section];
  return range ? Array.from({ length: range.to - range.from + 1 }, (_, i) => range.from + i) : [];
}

export function sectionParts(section: number) {
  const covered = sectionLessons(section);
  // Mixed chapters use separate samples: formulas never inherit prose speed.
  return [false, true]
    .map((precision) => {
      const indices = covered.filter((i) => (lessonRules(i).minCpm === 0) === precision);
      return {
        title: precision ? 'Znaky a přesnost' : 'Plynulé psaní',
        lessons: indices,
        minCpm: precision ? 0 : PASS_CPM,
      };
    })
    .filter((part) => part.lessons.length)
    .sort((a, b) => a.lessons[0] - b.lessons[0]);
}
export const placementStages = courseSections.map((section) => ({ ...section }));

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
  if (assessment?.kind === 'section') {
    const part = sectionParts(assessment.section)[assessment.part];
    return {
      minCpm: part?.minCpm ?? PASS_CPM,
      maxErrors: MAX_ERRORS,
      timeLimit: part?.minCpm === 0 ? null : 180,
    };
  }
  if (assessment?.kind !== 'placement') return lessonRules(lesson);
  const covered = stageLessons(assessment.stage);
  // A stage containing only precision lessons never introduces a speed requirement.
  const minCpm = covered.some((i) => lessonRules(i).minCpm > 0) ? PASS_CPM : 0;
  return { minCpm, maxErrors: MAX_ERRORS, timeLimit: minCpm ? 180 : null };
}

export function placementText(stage: number, variant: number, avoid = '') {
  const covered = stageLessons(stage);
  return coverageText(covered, variant, avoid);
}

export function sectionText(section: number, part: number, variant: number, avoid = '') {
  return coverageText(sectionParts(section)[part]?.lessons ?? [], variant, avoid);
}

function coverageText(covered: number[], variant: number, avoid: string) {
  if (!covered.length) throw new Error('Neplatná část rozřazení.');
  // Every credited lesson contributes an actual phrase; a prose test cannot
  // silently certify Excel or a key that was never included in the sample.
  for (let retry = 0; retry < 40; retry++) {
    const parts = covered.map((index, offset) => {
      const keys = lessons[index].keys;
      const budget = Math.max(12, Math.floor(320 / covered.length) - 4);
      const relevant = (values: string[]) =>
        values.filter((p) => !keys || [...keys].some((key) => p.includes(key)));
      const phrases = relevant(lessonPool(index)).filter((p) => p.length <= budget);
      const pool = phrases.length ? phrases : relevant(lessonPool(index, 'words'));
      const choice = Math.abs(variant + retry + offset) % pool.length;
      const first = pool[choice];
      let sample = first;
      if (lessons[index].keys)
        for (const key of lessons[index].keys) {
          if (sample.includes(key)) continue;
          const word = lessonPool(index, 'words')
            .filter((part) => part.includes(key))
            .sort((a, b) => a.length - b.length)[0];
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
