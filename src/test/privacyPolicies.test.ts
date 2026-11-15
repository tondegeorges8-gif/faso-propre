// @vitest-environment node
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { afterAll, describe, expect, it } from 'vitest';

const sessionFile = process.env.PRIVACY_SESSION_FILE;
describe.skipIf(!sessionFile)('Live authenticated owner isolation', () => {
  const env = Object.fromEntries(readFileSync('.env', 'utf8').split('\n').filter(line => line.includes('=')).map(line => {
    const separator = line.indexOf('=');
    return [line.slice(0, separator), line.slice(separator + 1).replace(/^"|"$/g, '')];
  }));
  const minted = sessionFile ? JSON.parse(readFileSync(sessionFile, 'utf8')).session : null;
  const options = { auth: { persistSession: false, autoRefreshToken: false } };
  const anon = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, options);
  const owner = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, {
    ...options, global: { headers: { Authorization: `Bearer ${minted?.access_token || ''}` } },
  });
  const userId = minted?.user.id || '';
  const foreignId = '00000000-0000-4000-8000-000000000001';
  const ownFile = `${userId}/privacy-check-${Date.now()}.txt`;
  const foreignFile = `${foreignId}/privacy-check.txt`;
  afterAll(async () => { if (minted) await owner.storage.from('avatars').remove([ownFile]); });

  it('blocks anonymous data reads', async () => {
    const { error } = await anon.from('profiles').select('id').limit(1);
    expect(error).not.toBeNull();
  });
  it('lets the authenticated owner read their saved profile', async () => {
    const { data, error } = await owner.from('profiles').select('id,user_id').eq('user_id', userId);
    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThan(0);
    expect(data?.every(row => row.user_id === userId)).toBe(true);
  });
  it('does not return other users profiles even to a directly querying admin identity', async () => {
    const { data, error } = await owner.from('profiles').select('id').neq('user_id', userId);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });
  it('allows updating the owners profile without changing its values', async () => {
    const { data, error } = await owner.from('profiles').update({ user_id: userId }).eq('user_id', userId).select('id');
    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThan(0);
  });
  it('blocks writes to other users profiles', async () => {
    const { data, error } = await owner.from('profiles').update({ nom: 'forbidden' }).neq('user_id', userId).select('id');
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });
  it('blocks changing ownership of a saved profile', async () => {
    const { error } = await owner.from('profiles').update({ user_id: foreignId }).eq('user_id', userId);
    expect(error).not.toBeNull();
  });
  it('blocks self assignment of privileged roles', async () => {
    const { error } = await owner.from('user_roles').insert({ user_id: userId, role: 'founder' });
    expect(error?.code).toBe('42501');
  });
  it('blocks anonymous indirect report reads', async () => {
    const { error } = await anon.rpc('get_public_signalement_pins');
    expect(error).not.toBeNull();
  });
  it('returns only owned report coordinates through the map helper', async () => {
    const reports = await owner.from('signalements').select('id');
    const pins = await owner.rpc('get_public_signalement_pins');
    expect(reports.error).toBeNull();
    expect(pins.error).toBeNull();
    const ids = new Set(reports.data?.map(row => row.id));
    expect(pins.data?.every((row: { id: string }) => ids.has(row.id))).toBe(true);
  });
  it('blocks upload to another owners folder', async () => {
    const { error } = await owner.storage.from('avatars').upload(foreignFile, 'not allowed', { contentType: 'text/plain' });
    expect(error).not.toBeNull();
  });
  it('lets the owner upload and download their file, but not an anonymous reader', async () => {
    const upload = await owner.storage.from('avatars').upload(ownFile, 'private-owner-check', { contentType: 'text/plain' });
    expect(upload.error).toBeNull();
    const download = await owner.storage.from('avatars').download(ownFile);
    expect(download.error).toBeNull();
    expect(await download.data?.text()).toBe('private-owner-check');
    const anonymous = await anon.storage.from('avatars').download(ownFile);
    expect(anonymous.error).not.toBeNull();
  });
  it('blocks moving a private file into another users folder', async () => {
    const { error } = await owner.storage.from('avatars').move(ownFile, foreignFile);
    expect(error).not.toBeNull();
  });
});