import { redirect } from 'next/navigation';

export default function AuthRedirectPage() {
  // Rute legacy /auth diarahkan langsung ke portal resmi pengelola /panel/login
  redirect('/panel/login');
}
