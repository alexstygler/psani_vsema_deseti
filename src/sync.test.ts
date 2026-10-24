import { describe, it, expect } from 'vitest';
import {
  freshProgress,
  addSession,
  mergeProgress,
  parseProgress,
  lessonPassed,
  lessonUnlocked,
  type Session,
} from './engine';
import { lessonText, lessons } from './curriculum';
import { synchronize, type Snapshot, type SyncTransport } from './sync';
const session = (id: string, patch: Partial<Session> = {}): Session => ({
  id,
  date: '2026-10-24T10:00:00Z',
  cpm: 150,
  accuracy: 98,
  seconds: 60,
  characters: 150,
  mode: 'beginner',
  lesson: 0,
  lessonVersion: 2,
  finished: true,
  errors: 3,
  device: 'notebook',
  keyStats: { f: { attempts: 10, errors: 1, ms: 500, samples: 5 } },
  ...patch,
});
describe('postup kurzem', () => {
  it('vyžaduje celý text, skutečných alespoň 150 CPM a nejvýše 3 chyby', () => {
    expect(lessonPassed(session('a'))).toBe(true);
    for (const patch of [
      { errors: 4 },
      { seconds: 60.01 },
      { finished: false },
      { lessonVersion: 1 },
      { characters: 99, seconds: 1 },
    ])
      expect(lessonPassed(session('a', patch))).toBe(false);
    expect(lessonUnlocked(1, [])).toBe(false);
    expect(lessonUnlocked(1, [0])).toBe(true);
  });
  it('má 36 lekcí s dostatečně dlouhými odlišnými variantami', () => {
    expect(lessons).toHaveLength(36);
    lessons.forEach((_, index) => {
      const a = lessonText(index, 0);
      const b = lessonText(index, 1);
      expect(a.length).toBeGreaterThanOrEqual(100);
      expect(a).not.toBe(b);
      if (index < 22) {
        const taught =
          lessons
            .slice(0, index + 1)
            .map((l) => l.keys)
            .join('') + ' ';
        expect([...a].every((c) => taught.includes(c))).toBe(true);
      }
    });
  });
  it('uchová starou historii, ale stará splnění neodemknou nový kurz', () => {
    const migrated = parseProgress(
      JSON.stringify({
        ...freshProgress(),
        version: 1,
        completed: [0, 1],
        sessions: [session('old', { lessonVersion: 1 })],
      }),
    );
    expect(migrated.sessions).toHaveLength(1);
    expect(migrated.completed).toEqual([]);
  });
});
describe('synchronizace dvou zařízení', () => {
  it('sloučí duplicitní pokusy jen jednou a sečte chyby přes jednotlivé pokusy', () => {
    const a = addSession(freshProgress(), session('a'));
    const b = addSession(a, session('b'));
    const merged = mergeProgress(a, b);
    expect(merged.sessions).toHaveLength(2);
    expect(merged.keys.f.attempts).toBe(20);
    expect(mergeProgress(merged, b)).toEqual(merged);
    expect(merged.completed).toEqual([0]);
  });
  it('při souběžném zápisu znovu načte revizi a zachová oba výsledky', async () => {
    let snapshot: Snapshot | null = null;
    const transport: SyncTransport = {
      async read() {
        return snapshot ? structuredClone(snapshot) : null;
      },
      async write(progress, expected) {
        if ((snapshot?.revision ?? null) !== expected) return false;
        snapshot = { revision: (expected ?? 0) + 1, progress: structuredClone(progress) };
        return true;
      },
    };
    await Promise.all([
      synchronize(addSession(freshProgress(), session('a')), transport),
      synchronize(addSession(freshProgress(), session('b')), transport),
    ]);
    const a = await synchronize(addSession(freshProgress(), session('a')), transport);
    expect(a.sessions.map((s) => s.id)).toEqual(['a', 'b']);
    expect(a.keys.f.errors).toBe(2);
  });
  it('nepotvrdí úspěch při výpadku serveru ani při neřešitelném konfliktu', async () => {
    await expect(
      synchronize(freshProgress(), {
        read: async () => {
          throw Error('offline');
        },
        write: async () => false,
      }),
    ).rejects.toThrow('offline');
    await expect(
      synchronize(freshProgress(), { read: async () => null, write: async () => false }),
    ).rejects.toThrow('Obě zařízení');
  });
});
