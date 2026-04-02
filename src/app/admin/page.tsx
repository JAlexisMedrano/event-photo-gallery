import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-neutral-800">Events Dashboard</h1>
        <Link 
          href="/admin/create" 
          className="bg-black text-white px-5 py-2 rounded-full font-medium hover:bg-neutral-800 transition-colors"
        >
          + New Event
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        {events.length === 0 ? (
          <div className="p-8 text-center text-neutral-500">
            No events found. Create your first event!
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                <th className="p-4 font-semibold text-neutral-600">Event Name</th>
                <th className="p-4 font-semibold text-neutral-600">Slug / Local Link</th>
                <th className="p-4 font-semibold text-neutral-600">Date Created</th>
                <th className="p-4 font-semibold text-neutral-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                  <td className="p-4 font-medium text-neutral-800">{event.name}</td>
                  <td className="p-4 text-neutral-500">
                    <Link href={`/${event.slug}`} target="_blank" className="hover:text-blue-600 hover:underline">
                      /{event.slug}
                    </Link>
                  </td>
                  <td className="p-4 text-neutral-500 text-sm">
                    {format(event.createdAt, 'MMM do, yyyy')}
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <Link href={`/admin/events/${event.slug}`} className="text-blue-600 hover:underline font-medium text-sm">
                      Moderate
                    </Link>
                    <Link href={`/${event.slug}/live`} target="_blank" className="text-emerald-600 hover:underline font-medium text-sm">
                      Live TV
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
