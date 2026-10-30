import { redirect } from 'next/navigation';

export default function AuthSetupRedirectPage() {
  redirect('/panel/login');
}
