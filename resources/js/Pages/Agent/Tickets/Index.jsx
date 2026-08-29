import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ auth, tickets, organizations, filters }) {
    
  // State lokal untuk menampung nilai filter saat ini
    const [currentFilters, setCurrentFilters] = useState({
        status: filters?.status || '',
        priority: filters?.priority || '',
        organization_id: filters?.organization_id || '',
    });

    // Helper untuk warna badge
    const getStatusColor = (status) => {
        const colors = {
            open: 'bg-yellow-100 text-yellow-800',
            in_progress: 'bg-blue-100 text-blue-800',
            resolved: 'bg-green-100 text-green-800',
            closed: 'bg-gray-100 text-gray-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getSlaColor = (slaStatus) => {
        const colors = {
            on_track: 'bg-green-100 text-green-700 border-green-200',
            due_soon: 'bg-orange-100 text-orange-700 border-orange-200',
            overdue: 'bg-red-100 text-red-700 border-red-200 font-bold animate-pulse',
            resolved: 'bg-gray-100 text-gray-600 border-gray-200',
        };
        return colors[slaStatus] || 'bg-gray-100 text-gray-600';
    };

    const formatText = (text) => text?.replace('_', ' ').toUpperCase() || '';

    // Menangani perubahan kombinasi filter
    const handleFilterChange = (key, value) => {
        const newFilters = { ...currentFilters, [key]: value };
        setCurrentFilters(newFilters);
        
        // Hapus filter yang bernilai kosong dari parameter URL agar rapi
        const queryParams = Object.fromEntries(Object.entries(newFilters).filter(([_, v]) => v !== ''));
        
        router.get(route('agent.tickets.index'), queryParams, { preserveState: true });
    };

    // Mengecek apakah ada filter yang sedang aktif untuk menampilkan tombol "Clear Filters"
    const hasActiveFilters = Object.values(currentFilters).some(val => val !== '');

    const clearFilters = () => {
        setCurrentFilters({ status: '', priority: '', organization_id: '' });
        router.get(route('agent.tickets.index'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Agent Workspace - All Tickets</h2>}
        >
            <Head title="Agent Workspace" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Bagian Filter */}
                    <div className="mb-6 bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div className="text-gray-700 font-medium">
                                Showing {tickets.length} tickets <span className="text-sm text-gray-500 font-normal">(Sorted by nearest SLA Deadline)</span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3">
                                <select 
                                    value={currentFilters.organization_id}
                                    onChange={(e) => handleFilterChange('organization_id', e.target.value)}
                                    className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                >
                                    <option value="">All Organizations</option>
                                    {organizations.map(org => (
                                        <option key={org.id} value={org.id}>{org.name}</option>
                                    ))}
                                </select>

                                <select 
                                    value={currentFilters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="open">Open</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>

                                <select 
                                    value={currentFilters.priority}
                                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                                    className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                >
                                    <option value="">All Priorities</option>
                                    <option value="low">Low</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                </select>

                                {hasActiveFilters && (
                                    <button 
                                        onClick={clearFilters}
                                        className="text-sm text-red-600 hover:text-red-800 font-medium px-2 py-1"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabel Tiket */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 overflow-x-auto">
                            
                            {tickets.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 text-lg">No tickets found matching your filters.</p>
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client / Org</th>
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
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-indigo-700">{ticket.organization.name}</div>
                                                    <div className="text-xs text-gray-500">Ticket #{ticket.id}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                                                    <div className="text-sm text-gray-500 truncate max-w-[200px]">{ticket.description}</div>
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
                                                        href={route('agent.tickets.show', ticket.id)} 
                                                        className="text-indigo-600 hover:text-indigo-900 font-bold bg-indigo-50 px-3 py-1 rounded"
                                                    >
                                                        Handle
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