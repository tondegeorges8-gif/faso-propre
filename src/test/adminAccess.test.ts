import { describe, expect, it } from 'vitest';
import { hasAdminEmail, hasAdminEntryEmail } from '@/lib/adminAccess';

describe('Exact Admin email restriction', () => {
  it('permits only tondegeorges8@gmail.com', () => {
    expect(hasAdminEmail('tondegeorges8@gmail.com')).toBe(true);
  });
  it('rejects all other emails, including casing and whitespace differences', () => {
    for (const email of ['luxeeternel98@gmail.com', 'citoyen@example.com', 'Tondegeorges8@gmail.com', 'tondegeorges8@gmail.com ', 'tondegeorges8@gmail.com.evil']) expect(hasAdminEmail(email)).toBe(false);
  });
  it('rejects signed-out users', () => {
    expect(hasAdminEmail(null)).toBe(false);
    expect(hasAdminEmail(undefined)).toBe(false);
  });
  it('reserves the Settings invitation to luxeeternel98@gmail.com without granting admin access', () => {
    expect(hasAdminEntryEmail('luxeeternel98@gmail.com')).toBe(true);
    expect(hasAdminEmail('luxeeternel98@gmail.com')).toBe(false);
    for (const email of [null, undefined, 'tondegeorges8@gmail.com', 'citoyen@example.com', 'Luxeeternel98@gmail.com']) expect(hasAdminEntryEmail(email)).toBe(false);
  });
});