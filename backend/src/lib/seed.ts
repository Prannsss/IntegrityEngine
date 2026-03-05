import bcrypt from 'bcryptjs';
import { JsonStore } from './json-store';

type Profile = {
  id: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'teacher' | 'student';
  baseline_fingerprint: Record<string, number> | null;
  baseline_sample_count: number;
  email_verified: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

const DEFAULT_ACCOUNTS = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'teacher@test.com',
    full_name: 'Dr. Smith',
    role: 'teacher' as const,
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'student@test.com',
    full_name: 'Jane Doe',
    role: 'student' as const,
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'student2@test.com',
    full_name: 'John Smith',
    role: 'student' as const,
  },
];

export async function seedDatabase() {
  const profiles = new JsonStore<Profile>('profiles.json', { useUuid: true });

  if (!profiles.isEmpty()) {
    console.log('  Database already seeded, skipping.');
    return;
  }

  console.log('  Seeding database with default accounts...');
  const password_hash = await bcrypt.hash('password', 10);
  const now = new Date().toISOString();

  for (const acct of DEFAULT_ACCOUNTS) {
    profiles.insert({
      id: acct.id,
      email: acct.email,
      password_hash,
      full_name: acct.full_name,
      avatar_url: null,
      role: acct.role,
      baseline_fingerprint: null,
      baseline_sample_count: 0,
      email_verified: true,
      last_login_at: null,
      created_at: now,
      updated_at: now,
    } as any);
  }

  console.log('  Seeded accounts:');
  for (const acct of DEFAULT_ACCOUNTS) {
    console.log(`    ${acct.role}: ${acct.email} / password`);
  }
}
