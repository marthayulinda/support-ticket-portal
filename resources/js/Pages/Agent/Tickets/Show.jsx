import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';

export default function Show({ auth, ticket }) {
    // Form untuk Balasan & Internal Note
    const { data: replyData, setData: setReplyData, post: postReply, processing: replying, reset: resetReply, errors: replyErrors } = useForm({
        body: '',
        is_internal: false,
    });

    // Form untuk Update Properti Tiket
    const { data: updateData, setData: setUpdateData, patch: patchTicket, processing: updating } = useForm({
        status: ticket.status,
        priority: ticket.priority,
    });

    const submitReply = (e) => {
        e.preventDefault();
        postReply(route('agent.tickets.reply', ticket.id), {
            onSuccess: () => resetReply('body', 'is_internal'),
        });
    };

    const submitUpdate = (e) => {
        e.preventDefault();
        patchTicket(route('agent.tickets.update', ticket.id), {
            preserveScroll: true,
        });
    };

    const assignToMe = () => {
        router.patch(route('agent.tickets.assign', ticket.id), {}, { preserveScroll: true });
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
                        Manage Ticket #{ticket.id}
                    </h2>
                    <Link href={route('agent.tickets.index')} className="text-gray-500 hover:text-gray-700">
                        &larr; Back to Workspace
                    </Link>
                </div>
            }
        >
            <Head title={`Manage Ticket #${ticket.id}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Header Info Banner */}
                    <div className="bg-blue-50 border border-blue-200 p-5 rounded-lg shadow-sm mb-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-blue-900">{ticket.title}</h3>
                            <p className="text-blue-700 text-sm mt-1">
                                Client: <span className="font-semibold">{ticket.user.name}</span> | 
                                Organization: <span className="font-semibold">{ticket.organization.name}</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-blue-700 font-medium">SLA Deadline</div>
                            <div className="font-mono font-bold text-xl text-blue-900">{formatDate(ticket.sla_deadline)}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* KIRI: Riwayat Percakapan & Form Balasan */}
                        <div className="md:col-span-2 space-y-6">
                            
                            {/* Keluhan Awal */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-gray-400">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="font-semibold text-gray-900">{ticket.user.name} (Client)</div>
                                    <div className="text-sm text-gray-500">{formatDate(ticket.created_at)}</div>
                                </div>
                                <p className="text-gray-800 whitespace-pre-wrap">{ticket.description}</p>
                            </div>

                            {/* Daftar Balasan */}
                            {ticket.replies.map((reply) => (
                                <div key={reply.id} className={`p-6 rounded-lg shadow-sm border-l-4 ${
                                    reply.is_internal 
                                        ? 'bg-amber-50 border-amber-500' // Styling khusus Internal Note
                                        : reply.user.role === 'agent' 
                                            ? 'bg-indigo-50 border-indigo-500' // Balasan Agent (Publik)
                                            : 'bg-white border-gray-400' // Balasan Client
                                }`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                                            {reply.user.name} 
                                            <span className="text-xs font-normal text-gray-500">({formatText(reply.user.role)})</span>
                                            {reply.is_internal && (
                                                <span className="bg-amber-200 text-amber-800 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">
                                                    Internal Note
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500">{formatDate(reply.created_at)}</div>
                                    </div>
                                    <p className="text-gray-800 whitespace-pre-wrap">{reply.body}</p>
                                </div>
                            ))}

                            {/* Form Balasan Agent */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Add a Reply</h3>
                                <form onSubmit={submitReply}>
                                    <textarea
                                        className={`w-full border-gray-300 focus:ring-2 rounded-md shadow-sm transition ${
                                            replyData.is_internal ? 'focus:border-amber-500 focus:ring-amber-200 bg-amber-50' : 'focus:border-indigo-500 focus:ring-indigo-200'
                                        }`}
                                        rows="5"
                                        placeholder={replyData.is_internal ? "Type your internal note here... (Clients will NOT see this)" : "Type your public response here... (Clients will see this)"}
                                        value={replyData.body}
                                        onChange={(e) => setReplyData('body', e.target.value)}
                                        required
                                    ></textarea>
                                    {replyErrors.body && <div className="text-red-500 text-sm mt-1">{replyErrors.body}</div>}
                                    
                                    <div className="mt-4 flex justify-between items-center">
                                        <label className="flex items-center space-x-2 cursor-pointer bg-gray-50 px-3 py-2 rounded border hover:bg-gray-100 transition">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-amber-600 shadow-sm focus:ring-amber-500 w-5 h-5"
                                                checked={replyData.is_internal}
                                                onChange={(e) => setReplyData('is_internal', e.target.checked)}
                                            />
                                            <span className="text-sm font-bold text-gray-700">Mark as Internal Note (Hidden from Client)</span>
                                        </label>

                                        <button
                                            type="submit"
                                            disabled={replying}
                                            className={`text-white px-6 py-2 rounded-md transition disabled:opacity-50 font-semibold ${
                                                replyData.is_internal ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
                                            }`}
                                        >
                                            {replying ? 'Sending...' : (replyData.is_internal ? 'Save Internal Note' : 'Send Public Reply')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* KANAN: Panel Kontrol Tiket */}
                        <div className="md:col-span-1 space-y-6">
                            
                            {/* Status & Priority Form */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Ticket Controls</h3>
                                
                                <form onSubmit={submitUpdate} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            value={updateData.status}
                                            onChange={(e) => setUpdateData('status', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="open">Open</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                        <select
                                            value={updateData.priority}
                                            onChange={(e) => setUpdateData('priority', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="low">Low</option>
                                            <option value="normal">Normal</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900 transition font-medium"
                                    >
                                        {updating ? 'Saving...' : 'Update Ticket'}
                                    </button>
                                </form>
                            </div>

                            {/* Assignment Box */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Assignment</h3>
                                {ticket.assignee ? (
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-bold text-xl">
                                            {ticket.assignee.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{ticket.assignee.name}</p>
                                            <p className="text-xs text-gray-500">Currently handling this ticket</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-3">This ticket is currently unassigned.</p>
                                        <button 
                                            onClick={assignToMe}
                                            className="w-full border-2 border-indigo-600 text-indigo-600 py-2 rounded-md hover:bg-indigo-50 transition font-bold"
                                        >
                                            Assign to Me
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}