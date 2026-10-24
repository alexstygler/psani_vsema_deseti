import { it, expect } from 'vitest';
import { validPublicConfig } from './cloud-config';
it('přijme jen veřejný klíč a HTTPS projekt, odmítne privilegovaný JWT', () => {
  const jwt = (role: string) => `header.${btoa(JSON.stringify({ role }))}.signature`;
  expect(validPublicConfig('https://project.supabase.co', 'sb_publishable_example')).toBe(true);
  expect(validPublicConfig('https://project.supabase.co', jwt('anon'))).toBe(true);
  expect(validPublicConfig('https://project.supabase.co', jwt('service_role'))).toBe(false);
  expect(validPublicConfig('https://project.supabase.co', 'sb_secret_example')).toBe(false);
  expect(validPublicConfig('http://project.supabase.co', 'sb_publishable_example')).toBe(false);
});
