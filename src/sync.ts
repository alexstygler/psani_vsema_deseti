import type { SupabaseClient } from '@supabase/supabase-js';
import { mergeProgress, parseProgress, type Progress } from './engine';

export type Snapshot = { revision: number; progress: Progress };
export interface SyncTransport {
  read(): Promise<Snapshot | null>;
  write(progress: Progress, expected: number | null): Promise<boolean>;
}
// Compare-and-swap prevents the last device to save from erasing another device's
// attempts. Conflicts re-read and merge immutable sessions by their UUID.
export async function synchronize(local: Progress, transport: SyncTransport) {
  let merged = local;
  for (let attempt = 0; attempt < 6; attempt++) {
    const remote = await transport.read();
    if (remote) merged = mergeProgress(merged, remote.progress);
    if (await transport.write(merged, remote?.revision ?? null)) return merged;
  }
  throw new Error(
    'Obě zařízení právě ukládají. Pokrok je v bezpečí místně; zkuste synchronizaci znovu.',
  );
}
export function supabaseTransport(client: SupabaseClient, userId: string): SyncTransport {
  return {
    async read() {
      const { data, error } = await client
        .from('lehce_progress')
        .select('payload, revision')
        .eq('user_id', userId)
        .maybeSingle();
      if (error)
        throw new Error(
          error.code === '42P01' || error.code === 'PGRST205'
            ? 'V Supabase nejprve spusťte přiložený soubor supabase/schema.sql.'
            : `Cloud nelze přečíst: ${error.message}`,
        );
      if (!data) return null;
      if (![1, 2].includes(data.payload?.version) || !Array.isArray(data.payload?.sessions))
        throw new Error('Cloud obsahuje neznámý formát. Místní data jsme zachovali.');
      return { revision: data.revision, progress: parseProgress(JSON.stringify(data.payload)) };
    },
    async write(progress, expected) {
      const value = {
        user_id: userId,
        payload: progress,
        revision: (expected ?? 0) + 1,
        updated_at: new Date().toISOString(),
      };
      if (expected === null) {
        const { error } = await client.from('lehce_progress').insert(value);
        if (error?.code === '23505') return false;
        if (error) throw new Error(`Cloud nelze uložit: ${error.message}`);
        return true;
      }
      const { data, error } = await client
        .from('lehce_progress')
        .update(value)
        .eq('user_id', userId)
        .eq('revision', expected)
        .select('revision');
      if (error) throw new Error(`Cloud nelze uložit: ${error.message}`);
      return !!data?.length;
    },
  };
}
