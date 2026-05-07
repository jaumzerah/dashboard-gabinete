import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export const metadata = {
  title: 'Dashboard — Apolônio',
};

export default async function DashboardLayout({ children }) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return children;
}
