import { redirect } from 'next/navigation';

export default function PortalIndexPage() {
  // Automatically redirect /portal traffic to /panel/login as per Master Spec V3.1
  redirect('/panel/login');
}
