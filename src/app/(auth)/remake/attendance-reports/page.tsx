import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/remake/attendances?tab=report');
}
