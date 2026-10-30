import { redirect } from 'next/navigation';

export default function PortalIndexPage() {
  // Automatically redirect /portal traffic to /login
  redirect('/login');
}
