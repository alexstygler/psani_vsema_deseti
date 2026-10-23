import { describe, expect, it } from 'vitest';
import {
  defaults,
  freshProgress,
  keyInfo,
  lessons,
  makeText,
  metrics,
  parseProgress,
  recordKey,
  weakestKeys,
} from './engine';

describe('měření a adaptivní trénink', () => {
  it('počítá CPM ze správných znaků a přesnost ze všech pokusů', () => {
    expect(metrics(100, 125, 100, 30)).toEqual({ cpm: 200, accuracy: 80 });
    expect(metrics(0, 0, 0, 0)).toEqual({ cpm: 0, accuracy: 100 });
  });
  it('sleduje chyby na očekávané klávese a vynechá pauzy z latence', () => {
    let keys = recordKey({}, 'ř', false, 100);
    keys = recordKey(keys, 'ř', true, 350);
    keys = recordKey(keys, 'ř', true, 10000);
    expect(keys['ř']).toEqual({ attempts: 3, errors: 1, ms: 350, samples: 1 });
    expect(weakestKeys(keys)[0].key).toBe('ř');
  });
  it('nabízí více vět s opakovaně chybným znakem', () => {
    const keys = { ř: { attempts: 10, errors: 6, ms: 800, samples: 4 } };
    const text = makeText('adaptive', 0, keys, 5);
    expect(text.split('. ')[0]).toContain('ř');
  });
  it('nepřeskakuje v prvních lekcích na dosud nenaučené klávesy', () => {
    let learned = ' ';
    lessons.slice(0, 7).forEach((lesson) => {
      learned += lesson.keys;
      expect([...lesson.text].every((char) => learned.includes(char))).toBe(true);
    });
  });
  it('přiřazuje QWERTZ, diakritiku, Shift a AltGr ke správným fyzickým klávesám', () => {
    expect(keyInfo('z')?.code).toBe('KeyY');
    expect(keyInfo('y')?.code).toBe('KeyZ');
    expect(keyInfo('ě')?.code).toBe('Digit2');
    expect(keyInfo('3')).toMatchObject({ code: 'Digit3', shift: true });
    expect(keyInfo('*')).toMatchObject({ code: 'Slash', alt: true });
    expect(keyInfo('A')).toMatchObject({ code: 'KeyA', shift: true });
    expect(keyInfo('ť')).toMatchObject({ code: 'KeyT', dead: 'caron' });
    expect(keyInfo('Á')).toMatchObject({ code: 'KeyA', dead: 'acute', shift: true });
    expect(keyInfo('Ů')).toMatchObject({ code: 'Semicolon', caps: true });
  });
  it('normalizuje vlastní text a zachovává české znaky', () => {
    expect(makeText('custom', 0, {}, 0, '  pr\u030ci\u0301lis\u030c\n\n text  ')).toBe(
      'příliš text',
    );
  });
});
describe('uložení pokroku', () => {
  it('přežije poškozená data bez pádu aplikace', () => {
    expect(parseProgress('{broken')).toEqual(freshProgress());
    expect(parseProgress(null).settings).toEqual(defaults);
    expect(parseProgress(JSON.stringify({ version: 2 }))).toEqual(freshProgress());
  });
  it('odmítne neplatné statistiky a omezí nastavení', () => {
    const p = freshProgress();
    const restored = parseProgress(
      JSON.stringify({
        ...p,
        settings: { goal: 9999, duration: 12 },
        keys: { a: { attempts: 1, errors: 8, ms: 0, samples: 0 } },
        sessions: [{ id: 'bad', cpm: 'fake' }],
      }),
    );
    expect(restored.keys).toEqual({});
    expect(restored.sessions).toEqual([]);
    expect(restored.settings.goal).toBe(600);
    expect(restored.settings.duration).toBe(60);
  });
});
