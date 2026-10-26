import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAccess } from '@/hooks/useAdminAccess';

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { isAdmin, isLoading } = useAdminAccess();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div role="status" aria-label="Chargement" className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}