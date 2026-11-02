export const ADMIN_EMAIL = 'tondegeorges8@gmail.com';
export const ADMIN_ENTRY_EMAIL = 'luxeeternel98@gmail.com';

// Presentation check only; all privileged data is also checked on the server.
export const hasAdminEmail = (email?: string | null) => email === ADMIN_EMAIL;
export const hasAdminEntryEmail = (email?: string | null) => email === ADMIN_ENTRY_EMAIL;