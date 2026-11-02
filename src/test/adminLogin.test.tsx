import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminLogin from '@/pages/AdminLogin';

const state = vi.hoisted(() => ({
  user: { id: 'entry', email: 'luxeeternel98@gmail.com' } as { id: string; email: string } | null,
  login: vi.fn(),
  rpc: vi.fn(),
}));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: state.user, login: state.login, isLoading: false }) }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { rpc: state.rpc } }));

function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const tree = () => <QueryClientProvider client={client}><MemoryRouter initialEntries={['/admin/connexion']}><Routes>
    <Route path="/" element={<div data-testid="home" />} />
    <Route path="/admin/connexion" element={<AdminLogin />} />
    <Route path="/admin" element={<div data-testid="private" />} />
  </Routes></MemoryRouter></QueryClientProvider>;
  const result = render(tree());
  return () => result.rerender(tree());
}

async function fill(email = 'tondegeorges8@gmail.com') {
  fireEvent.change(await screen.findByLabelText('Email administrateur'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Mot de passe'), { target: { value: 'test-only-password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Déverrouiller le tableau de bord' }));
}

describe('Admin credential verification', () => {
  beforeEach(() => {
    state.user = { id: 'entry', email: 'luxeeternel98@gmail.com' };
    state.login.mockReset();
    state.rpc.mockReset();
    state.rpc.mockImplementation(async (name: string) => ({ data: name === 'is_admin_entry_account', error: null }));
  });

  it('does not authenticate a non-admin email even from the entry account', async () => {
    mount();
    await fill('luxeeternel98@gmail.com');
    expect(state.login).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByTestId('private')).not.toBeInTheDocument();
  });

  it('keeps invalid passwords locked and clears the password input', async () => {
    state.login.mockResolvedValue({ success: false });
    mount();
    await fill();
    await screen.findByRole('alert');
    expect(screen.getByLabelText('Mot de passe')).toHaveValue('');
    expect(screen.queryByTestId('private')).not.toBeInTheDocument();
  });

  it('requires password sign-in, new admin identity, and server approval before navigating', async () => {
    state.login.mockResolvedValue({ success: true });
    const refresh = mount();
    await fill();
    await waitFor(() => expect(state.login).toHaveBeenCalledWith('tondegeorges8@gmail.com', 'test-only-password'));
    expect(screen.queryByTestId('private')).not.toBeInTheDocument();
    state.user = { id: 'admin', email: 'tondegeorges8@gmail.com' };
    state.rpc.mockResolvedValue({ data: true, error: null });
    refresh();
    await screen.findByTestId('private');
    expect(state.rpc).toHaveBeenCalledWith('is_app_admin');
  });

  it('redirects ordinary identities instead of exposing the verification form', async () => {
    state.user = { id: 'ordinary', email: 'citoyen@example.com' };
    mount();
    await screen.findByTestId('home');
    expect(screen.queryByLabelText('Email administrateur')).not.toBeInTheDocument();
  });
});