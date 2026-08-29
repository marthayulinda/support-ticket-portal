import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, tickets }) {
    
    // Helper untuk warna badge status
    const getStatusColor = (status) => {
        const colors = {
            open: 'bg-yellow-100 text-yellow-800',
            in_progress: 'bg-blue-100 text-blue-800',
            resolved: 'bg-green-100 text-green-800',
            closed: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    // Helper untuk warna badge SLA
    const getSlaColor = (slaStatus) => {
        const colors = {
            on_track: 'bg-green-100 text-green-700 border-green-200',
            due_soon: 'bg-orange-100 text-orange-700 border-orange-200',
            overdue: 'bg-red-100 text-red-700 border-red-200 font-bold',
            resolved: 'bg-gray-100 text-gray-600 border-gray-200',
        };
        return colors[slaStatus] || 'bg-gray-100 text-gray-600';
    };

    // Helper merapikan teks enum
    const formatText = (text) => text.replace('_', ' ').toUpperCase();

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">My Organization Tickets</h2>}
        >
            <Head title="My Tickets" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Tombol Buat Tiket Baru (Routenya belum kita buat, sementara diarahkan ke index) */}
                    <div className="mb-6 flex justify-end">
                        <Link
                            href={route('client.tickets.create')}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                        >
                            + Create New Ticket
                        </Link>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 overflow-x-auto">
                            
                            {tickets.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">No tickets found for your organization.</p>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SLA Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {tickets.map((ticket) => (
                                            <tr key={ticket.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    #{ticket.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">{ticket.description}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                                        {formatText(ticket.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded border ${getSlaColor(ticket.sla_status)}`}>
                                                        {formatText(ticket.sla_status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatText(ticket.priority)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link 
                                                        href={route('client.tickets.show', ticket.id)} 
                                                        className="text-indigo-600 hover:text-indigo-900 font-semibold"
                                                    >
                                                        View Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}