export const ADMIN_EMAIL = 'luxeeternel98@gmail.com';

// Presentation check only; all privileged data is also checked on the server.
export const hasAdminEmail = (email?: string | null) => email === ADMIN_EMAIL;