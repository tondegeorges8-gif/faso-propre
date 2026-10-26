import { describe, expect, it } from 'vitest';
import { hasAdminEmail } from '@/lib/adminAccess';

describe('Exact Admin email restriction', () => {
  it('permits only tondegeorges8@gmail.com', () => {
    expect(hasAdminEmail('tondegeorges8@gmail.com')).toBe(true);
  });
  it('rejects all other emails, including casing and whitespace differences', () => {
    for (const email of ['citoyen@example.com', 'Tondegeorges8@gmail.com', 'tondegeorges8@gmail.com ', 'tondegeorges8@gmail.com.evil']) expect(hasAdminEmail(email)).toBe(false);
  });
  it('rejects signed-out users', () => {
    expect(hasAdminEmail(null)).toBe(false);
    expect(hasAdminEmail(undefined)).toBe(false);
  });
});