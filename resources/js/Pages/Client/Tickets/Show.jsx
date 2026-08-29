import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Show({ auth, ticket }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        body: '',
    });

    const submitReply = (e) => {
        e.preventDefault();
        post(route('client.tickets.reply', ticket.id), {
            onSuccess: () => reset('body'),
        });
    };

    // Helpers
    const formatText = (text) => text?.replace('_', ' ').toUpperCase() || '';
    const formatDate = (dateString) => new Date(dateString).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Ticket #{ticket.id} - {ticket.title}
                    </h2>
                    <Link href={route('client.tickets.index')} className="text-gray-500 hover:text-gray-700">
                        &larr; Back to Tickets
                    </Link>
                </div>
            }
        >
            <Head title={`Ticket #${ticket.id}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* KIRI: Riwayat Percakapan & Form */}
                        <div className="md:col-span-2 space-y-6">
                            
                            {/* Deskripsi Awal (Keluhan Client) */}
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="font-semibold text-gray-900">{ticket.user.name} (You)</div>
                                    <div className="text-sm text-gray-500">{formatDate(ticket.created_at)}</div>
                                </div>
                                <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                            </div>

                            {/* Daftar Balasan (Replies) */}
                            {ticket.replies.map((reply) => (
                                <div key={reply.id} className={`p-6 rounded-lg shadow-sm ${reply.user_id === auth.user.id ? 'bg-white' : 'bg-indigo-50 border border-indigo-100'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="font-semibold text-gray-900">
                                            {reply.user_id === auth.user.id ? 'You' : reply.user.name + ' (Support Agent)'}
                                        </div>
                                        <div className="text-sm text-gray-500">{formatDate(reply.created_at)}</div>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap">{reply.body}</p>
                                </div>
                            ))}

                            {/* Form Tambah Balasan (Hanya muncul jika tiket belum ditutup) */}
                            {ticket.status !== 'closed' && (
                                <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-indigo-500">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Add a Reply</h3>
                                    <form onSubmit={submitReply}>
                                        <textarea
                                            className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                            rows="4"
                                            placeholder="Type your response here..."
                                            value={data.body}
                                            onChange={(e) => setData('body', e.target.value)}
                                            required
                                        ></textarea>
                                        {errors.body && <div className="text-red-500 text-sm mt-1">{errors.body}</div>}
                                        
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition"
                                            >
                                                {processing ? 'Sending...' : 'Send Reply'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* KANAN: Sidebar Informasi Tiket */}
                        <div className="md:col-span-1 space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Ticket Details</h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm text-gray-500">Status</div>
                                        <div className="font-semibold text-gray-900">{formatText(ticket.status)}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Priority</div>
                                        <div className="font-semibold text-gray-900">{formatText(ticket.priority)}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">SLA Status</div>
                                        <div className="font-semibold text-gray-900">{formatText(ticket.sla_status)}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Assigned To</div>
                                        <div className="font-semibold text-gray-900">{ticket.assignee ? ticket.assignee.name : 'Unassigned'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}