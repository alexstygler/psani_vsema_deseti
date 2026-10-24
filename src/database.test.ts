import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { it, expect } from 'vitest';
it('PostgreSQL RLS oddělí účty a nepustí anonymní čtení', async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;
      insert into auth.users values ('11111111-1111-1111-1111-111111111111'),('22222222-2222-2222-2222-222222222222');`);
    await db.exec(await readFile(new URL('../supabase/schema.sql', import.meta.url), 'utf8'));
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111',false);
      insert into public.lehce_progress(user_id,payload) values ('11111111-1111-1111-1111-111111111111','{"version":2}');`);
    expect(
      (
        await db.query<{ count: number }>(
          'select count(*)::int as count from public.lehce_progress',
        )
      ).rows[0].count,
    ).toBe(1);
    await db.exec(
      `select set_config('request.jwt.claim.sub','22222222-2222-2222-2222-222222222222',false);`,
    );
    expect(
      (
        await db.query<{ count: number }>(
          'select count(*)::int as count from public.lehce_progress',
        )
      ).rows[0].count,
    ).toBe(0);
    expect(
      (await db.query('update public.lehce_progress set revision=2 returning user_id')).rows,
    ).toHaveLength(0);
    await expect(
      db.exec(
        `insert into public.lehce_progress(user_id,payload) values ('11111111-1111-1111-1111-111111111111','{}')`,
      ),
    ).rejects.toThrow(/row-level security/);
    await db.exec('reset role; set role anon;');
    await expect(db.query('select * from public.lehce_progress')).rejects.toThrow(
      /permission denied/,
    );
  } finally {
    await db.close();
  }
}, 30000);
