import { redirect } from 'next/navigation';

export default function AdminIndexPage() {
  // Automatically redirect /admin traffic to the dedicated /login
  redirect('/login');
}
