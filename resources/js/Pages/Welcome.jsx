import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Welcome to Support Portal" />
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
                
                {/* Navigation Bar */}
                <nav className="bg-white border-b border-gray-200 py-4 px-6 md:px-12 flex justify-between items-center shadow-sm">
                    <div className="font-extrabold text-2xl text-indigo-700 tracking-tight">
                        Support Ticket Portal
                    </div>
                    <div>
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="text-indigo-600 hover:text-indigo-800 font-bold transition"
                            >
                                Enter Workspace &rarr;
                            </Link>
                        ) : (
                            <div className="space-x-4 flex items-center">
                                <Link
                                    href={route('login')}
                                    className="text-gray-600 hover:text-gray-900 font-medium transition"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700 transition font-medium shadow-sm"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Hero Section */}
                <main className="flex-grow flex items-center justify-center p-6">
                    <div className="max-w-4xl text-center space-y-8">
                        <div className="inline-block bg-indigo-100 text-indigo-800 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase mb-2">
                            Support Ticket Portal Prototype
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
                            Streamlined Support for <br className="hidden md:block" />
                            <span className="text-indigo-600">Your Organization</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Submit tickets, track SLAs in real-time, and communicate directly with our support agents through a secure and unified portal.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-lg text-lg hover:bg-indigo-700 transition font-bold shadow-md"
                                >
                                    Access Your Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-lg text-lg hover:bg-indigo-700 transition font-bold shadow-md"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="w-full sm:w-auto bg-white text-indigo-600 border-2 border-indigo-100 px-8 py-3.5 rounded-lg text-lg hover:bg-indigo-50 hover:border-indigo-200 transition font-bold shadow-sm"
                                    >
                                        Register Client
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="py-8 text-center text-sm text-gray-500 font-medium">
                    &copy; {new Date().getFullYear()} Support Ticket Portal. Assignment by Martha Yulinda Lbn Tobing.
                </footer>
            </div>
        </>
    );
}