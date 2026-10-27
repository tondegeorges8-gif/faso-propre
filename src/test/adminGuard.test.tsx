import { act, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminGuard from '@/components/auth/AdminGuard';
import { useAdminAccess } from '@/hooks/useAdminAccess';

const state = vi.hoisted(() => ({
  auth: { user: null as { id: string; email: string } | null, isLoading: false },
  rpc: vi.fn(),
}));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => state.auth }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { rpc: state.rpc } }));

function AccessProbe() {
  const { isAdmin } = useAdminAccess();
  return <output data-testid="access">{String(isAdmin)}</output>;
}

function mount(client = new QueryClient({ defaultOptions: { queries: { retry: false } } })) {
  return render(
    <QueryClientProvider client={client}>
      <AccessProbe />
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<div data-testid="home" />} />
          <Route path="/admin" element={<AdminGuard><div data-testid="private" /></AdminGuard>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Admin identity and direct route protection', () => {
  beforeEach(() => {
    state.auth = { user: null, isLoading: false };
    state.rpc.mockReset();
  });

  it.each([null, 'citoyen@example.com', 'Tondegeorges8@gmail.com', 'tondegeorges8@gmail.com '])(
    'redirects unauthorized identity %s to home without requesting Admin data', async (email) => {
      state.auth.user = email === null ? null : { id: 'citizen', email };
      mount();
      await waitFor(() => expect(screen.getByTestId('home')).toBeInTheDocument());
      expect(screen.getByTestId('access')).toHaveTextContent('false');
      expect(screen.queryByTestId('private')).not.toBeInTheDocument();
      expect(state.rpc).not.toHaveBeenCalled();
    },
  );

  it('allows the exact owner email only after server approval', async () => {
    state.auth.user = { id: 'owner', email: 'tondegeorges8@gmail.com' };
    state.rpc.mockResolvedValue({ data: true, error: null });
    mount();
    await waitFor(() => expect(screen.getByTestId('private')).toBeInTheDocument());
    expect(screen.getByTestId('access')).toHaveTextContent('true');
    expect(state.rpc).toHaveBeenCalledWith('is_app_admin');
  });

  it.each([{ data: false, error: null }, { data: null, error: new Error('denied') }])(
    'rejects the owner email when server validation fails: %s', async (result) => {
      state.auth.user = { id: 'owner', email: 'tondegeorges8@gmail.com' };
      state.rpc.mockResolvedValue(result);
      mount();
      await waitFor(() => expect(screen.getByTestId('home')).toBeInTheDocument());
      expect(screen.getByTestId('access')).toHaveTextContent('false');
    },
  );

  it('hides cached approval until the current identity is revalidated', async () => {
    state.auth.user = { id: 'owner', email: 'tondegeorges8@gmail.com' };
    const client = new QueryClient();
    client.setQueryData(['admin-access', 'owner', 'tondegeorges8@gmail.com'], true);
    let finish: ((value: { data: boolean; error: null }) => void) | undefined;
    state.rpc.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    mount(client);
    expect(screen.getByTestId('access')).toHaveTextContent('false');
    expect(screen.queryByTestId('private')).not.toBeInTheDocument();
    await act(async () => { finish?.({ data: false, error: null }); });
    await waitFor(() => expect(screen.getByTestId('home')).toBeInTheDocument());
  });
});