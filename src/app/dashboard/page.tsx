/**
 * @deprecated Legacy dashboard page. Use /teacher instead.
 * Kept for reference only — uses mock data from TeacherDashboard component.
 */

import { redirect } from 'next/navigation';

export default function DashboardPage() {
  redirect('/teacher');
}
