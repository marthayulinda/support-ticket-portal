import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        priority: 'normal',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('client.tickets.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Create New Ticket</h2>}
        >
            <Head title="Create Ticket" />

            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject / Title</label>
                                <input
                                    type="text"
                                    className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    required
                                />
                                {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority Level</label>
                                <select
                                    className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.priority}
                                    onChange={(e) => setData('priority', e.target.value)}
                                >
                                    <option value="low">Low (SLA: 3 Days)</option>
                                    <option value="normal">Normal (SLA: 24 Hours)</option>
                                    <option value="high">High (SLA: 4 Hours)</option>
                                </select>
                                {errors.priority && <div className="text-red-500 text-sm mt-1">{errors.priority}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    rows="6"
                                    placeholder="Please describe your issue in detail..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    required
                                ></textarea>
                                {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <Link href={route('client.tickets.index')} className="text-gray-600 hover:text-gray-900 font-medium">
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
                                >
                                    {processing ? 'Submitting...' : 'Submit Ticket'}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}