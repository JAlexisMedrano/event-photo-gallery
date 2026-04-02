import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect main landing to the admin dashboard for the owner's convenience.
  redirect('/admin');
}
