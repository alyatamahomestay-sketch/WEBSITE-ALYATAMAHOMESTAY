import { redirect } from 'next/navigation';

export default function AuthRedirectPage() {
  // Rute legacy /auth diarahkan langsung ke portal login pengelola /login
  redirect('/login');
}
