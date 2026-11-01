import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Settings from '@/pages/Settings';

const state = vi.hoisted(() => ({
  user: null as { id: string; email: string } | null,
  rpc: vi.fn(),
}));
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: state.user,
    profile: null,
    isLoading: false,
    isAuthenticated: state.user !== null,
    updateProfile: vi.fn(),
    logout: vi.fn(),
  }),
}));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { rpc: state.rpc } }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));

function mount() {
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={['/settings']}>
        <Routes>
          <Route path="/settings" element={<Settings />} />
          <Route path="/auth" element={<div data-testid="auth" />} />
          <Route path="/admin" element={<div data-testid="admin-destination" />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Private Settings administration access', () => {
  beforeEach(() => { state.user = null; state.rpc.mockReset(); });

  it.each([null, 'citoyen@example.com', 'tondegeorges8@gmail.com'])(
    'does not expose administration to %s', async email => {
      state.user = email ? { id: 'other', email } : null;
      mount();
      if (!email) await waitFor(() => expect(screen.getByTestId('auth')).toBeInTheDocument());
      expect(screen.queryByRole('button', { name: /Administration/ })).not.toBeInTheDocument();
      expect(state.rpc).not.toHaveBeenCalled();
    },
  );

  it('lets luxeeternel98@gmail.com open administration after server approval', async () => {
    state.user = { id: 'owner', email: 'luxeeternel98@gmail.com' };
    state.rpc.mockResolvedValue({ data: true, error: null });
    mount();
    fireEvent.click(await screen.findByRole('button', { name: /Administration/ }));
    expect(screen.getByTestId('admin-destination')).toBeInTheDocument();
  });

  it('never exposes administration while approval is pending or denied', async () => {
    state.user = { id: 'owner', email: 'luxeeternel98@gmail.com' };
    state.rpc.mockResolvedValue({ data: false, error: null });
    mount();
    expect(screen.queryByRole('button', { name: /Administration/ })).not.toBeInTheDocument();
    await waitFor(() => expect(state.rpc).toHaveBeenCalledWith('is_app_admin'));
    expect(screen.queryByRole('button', { name: /Administration/ })).not.toBeInTheDocument();
  });
});