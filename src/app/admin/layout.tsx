import { ReactNode } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-r shadow-sm p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 to-neutral-500">
            Event Admin
          </h2>
        </div>
        <nav className="flex flex-col gap-3">
          <Link href="/admin" className="text-neutral-600 hover:text-black font-medium transition-colors">
            Dashboard
          </Link>
          <Link href="/admin/create" className="text-neutral-600 hover:text-black font-medium transition-colors">
            Create Event
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
