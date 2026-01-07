import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Globe,
    ShieldAlert,
    ShieldCheck,
    Grid,
    Settings,
    LogOut,
    Menu,
    Activity,
    UserCircle,
    Terminal,
    Network,
    FileText,
    Sun,
    Moon,
    Lock,
    Key,
    Undo,
    Server
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { apiClient } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { ChangePasswordModal } from '../features/auth/ChangePasswordModal';
import { ConfigureTwoFactorModal } from '../features/auth/ConfigureTwoFactorModal';
import { CreateApiTokenModal } from '../features/auth/CreateApiTokenModal';
import { MyProfileModal } from '../features/auth/MyProfileModal';

export const MainLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userDisplayName, setUserDisplayName] = useState('');
    const { theme, toggleTheme } = useTheme();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [location.pathname]);

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showConfigure2FAModal, setShowConfigure2FAModal] = useState(false);
    const [showCreateApiTokenModal, setShowCreateApiTokenModal] = useState(false);
    const [showMyProfileModal, setShowMyProfileModal] = useState(false);
    const [username, setUsername] = useState('');
    const [totpEnabled, setTotpEnabled] = useState(false);

    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const fetchSession = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                // Fetch fresh session data like legacy app does
                const response = await apiClient.get<any>('/user/session/get');
                const sessionData = response.data;

                // The legacy API returns the session object directly or wrapped. 
                // Based on auth.js: sessionData = responseJSON;
                // And loading MainLayout implies we are authenticated.

                if (sessionData) {
                    // Update state
                    setUserDisplayName(sessionData.displayName || 'User');
                    setUsername(sessionData.username || '');
                    if (sessionData.totpEnabled !== undefined) {
                        setTotpEnabled(sessionData.totpEnabled);
                    }

                    // Check for admin permissions with robust fallback
                    const permissions = sessionData.info?.permissions;
                    // Check for pascal case (C# Default) or camel case
                    const adminPerm = permissions?.Administration || permissions?.administration;
                    const isDefaultAdmin = (sessionData.username || '').toLowerCase() === 'admin';

                    const hasAdminAccess = (adminPerm && adminPerm.canView === true) || isDefaultAdmin;

                    console.log('[MainLayout] Admin Access Check:', {
                        hasAccess: hasAdminAccess,
                        username: sessionData.username,
                        permFound: !!adminPerm
                    });

                    setIsAdmin(hasAdminAccess);

                    // Update localStorage to keep it fresh
                    const user = localStorage.getItem('user');
                    let parsed = user ? JSON.parse(user) : {};
                    parsed = { ...parsed, ...sessionData };
                    localStorage.setItem('user', JSON.stringify(parsed));
                }
            } catch (e) {
                console.error('[MainLayout] Session fetch failed', e);
                // If session fetch fails, we might be expired, but apiClient interceptor handles 401/invalid-token.
                // We'll rely on stored data if fetch fails but no redirect happened.
                const user = localStorage.getItem('user');
                if (user) {
                    try {
                        const parsed = JSON.parse(user);
                        setUserDisplayName(parsed.displayName || 'User');
                        setUsername(parsed.username || '');
                        if (parsed.totpEnabled !== undefined) {
                            setTotpEnabled(parsed.totpEnabled);
                        }

                        const permissions = parsed.info?.permissions;
                        const adminPerm = permissions?.Administration || permissions?.administration;
                        const isDefaultAdmin = (parsed.username || '').toLowerCase() === 'admin';
                        const hasAdminAccess = (adminPerm && adminPerm.canView === true) || isDefaultAdmin;

                        setIsAdmin(hasAdminAccess);
                    } catch (err) { /* ignore */ }
                }
            }
        };

        fetchSession();
    }, [showMyProfileModal, showConfigure2FAModal]); // Refresh when modals close/update

    // Check for "Change Password" request from login
    useEffect(() => {
        const state = location.state as { showChangePassword?: boolean } | null;
        if (state?.showChangePassword) {
            setShowChangePasswordModal(true);
            // Clear state so it doesn't persist on refresh
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname]);

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            await apiClient.post(`/user/logout?token=${token}`);
        } catch (e) {
            // ignore
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Globe, label: 'Zones', path: '/zones' },
        { icon: Network, label: 'DHCP', path: '/dhcp' },
        { icon: Grid, label: 'Apps', path: '/apps' },
        { icon: FileText, label: 'Logs', path: '/logs' },
        { icon: Terminal, label: 'DNS Client', path: '/tools/dns-client' },
        { icon: Activity, label: 'Cache', path: '/cache' },
        { icon: ShieldCheck, label: 'Allowed', path: '/allowed' },
        { icon: ShieldAlert, label: 'Blocked', path: '/blocked' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    if (isAdmin) {
        navItems.push({ icon: Server, label: 'Administration', path: '/admin' });
    }

    const currentRouteName = navItems.find(item => item.path === location.pathname)?.label || 'Dashboard';

    return (
        <div className="h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300 font-sans flex overflow-hidden">
            {/* Global Toaster */}
            <Toaster position="bottom-right" toastOptions={{
                className: 'bg-white dark:bg-slate-800 dark:text-white shadow-lg border border-gray-100 dark:border-slate-700',
                duration: 3000,
            }} />

            {/* Modals */}
            <ChangePasswordModal
                isOpen={showChangePasswordModal}
                onClose={() => setShowChangePasswordModal(false)}
                username={username}
                totpEnabled={totpEnabled}
            />
            <ConfigureTwoFactorModal
                isOpen={showConfigure2FAModal}
                onClose={() => setShowConfigure2FAModal(false)}
                username={username}
                onStatusChange={(enabled) => {
                    setTotpEnabled(enabled);
                    // Update user in local storage to persist 2fa status state
                    const user = localStorage.getItem('user');
                    if (user) {
                        const parsed = JSON.parse(user);
                        parsed.totpEnabled = enabled;
                        localStorage.setItem('user', JSON.stringify(parsed));
                    }
                }}
            />
            <CreateApiTokenModal
                isOpen={showCreateApiTokenModal}
                onClose={() => setShowCreateApiTokenModal(false)}
                username={username}
                totpEnabled={totpEnabled}
            />
            <MyProfileModal
                isOpen={showMyProfileModal}
                onClose={() => setShowMyProfileModal(false)}
            />

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Floating Sidebar (Desktop) / Drawer (Mobile) */}
            <aside
                className={`fixed lg:static top-0 left-0 z-50 h-[calc(100vh-2rem)] w-64 m-4 rounded-2xl 
                bg-white dark:bg-slate-900 shadow-soft-xl dark:shadow-none 
                transition-transform duration-300 ease-in-out transform flex flex-col
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[110%] lg:translate-x-0'}
                border border-transparent dark:border-slate-800 lg:sticky lg:top-4
                `}
            >
                <div className="h-full flex flex-col p-4">
                    {/* Logo */}
                    <div className="px-4 py-3 flex items-center space-x-3 mb-6">
                        <img src={`${import.meta.env.BASE_URL}img/logo.png`} alt="Logo" className="w-8 h-8" />
                        <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            Technitium
                        </span>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent mb-6" />

                    {/* Nav */}
                    <nav className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group mx-2 ${isActive
                                        ? 'bg-white dark:bg-slate-800 shadow-soft-md dark:shadow-none'
                                        : 'hover:bg-gray-100 dark:hover:bg-slate-800/50'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className={`p-1.5 rounded-lg shadow-sm transition-all duration-300 ${isActive
                                            ? 'bg-primary text-white shadow-primary/30'
                                            : 'bg-indigo-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-primary'
                                            }`}>
                                            <item.icon size={16} />
                                        </div>
                                        <span className={`text-sm font-medium ${isActive
                                            ? 'text-slate-800 dark:text-white'
                                            : 'text-slate-600 dark:text-slate-400'
                                            }`}>
                                            {item.label}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>


                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Navbar (Desktop & Mobile) */}
                <header className="px-6 py-4 flex items-center justify-between z-30 transition-all duration-300">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <span className="opacity-70">Pages</span>
                            <span>/</span>
                            <span>{currentRouteName}</span>
                        </div>
                        <h1 className="text-lg font-bold text-slate-800 dark:text-white capitalize">
                            {currentRouteName}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <Menu size={20} />
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full cursor-pointer text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <a
                            href="https://github.com/TechnitiumSoftware/DnsServer"
                            target="_blank"
                            rel="noreferrer"
                            className="hidden sm:block text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-semibold"
                        >
                            GitHub
                        </a>

                        {/* User Profile */}
                        <div className="relative">
                            <div
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors border border-transparent dark:border-slate-800"
                            >
                                <div className="hidden md:block text-right">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">{userDisplayName}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Administrator</p>
                                </div>
                                <div className="bg-white dark:bg-slate-700 p-1.5 rounded-full shadow-sm">
                                    <UserCircle size={20} className="text-slate-500 dark:text-slate-400" />
                                </div>
                            </div>

                            {/* Dropdown Menu */}
                            {isUserMenuOpen && (
                                <>
                                    <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden py-1 z-50">
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 md:hidden">
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{userDisplayName}</p>
                                            <p className="text-xs text-slate-500">Administrator</p>
                                        </div>
                                        <button
                                            onClick={() => { setShowMyProfileModal(true); setIsUserMenuOpen(false); }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2"
                                        >
                                            <UserCircle size={16} /> My Profile
                                        </button>
                                        <button
                                            onClick={() => { setShowCreateApiTokenModal(true); setIsUserMenuOpen(false); }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2"
                                        >
                                            <Key size={16} /> Create API Token
                                        </button>
                                        <button
                                            onClick={() => { setShowChangePasswordModal(true); setIsUserMenuOpen(false); }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2"
                                        >
                                            <Lock size={16} /> Change Password
                                        </button>
                                        <button
                                            onClick={() => { setShowConfigure2FAModal(true); setIsUserMenuOpen(false); }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2"
                                        >
                                            <ShieldCheck size={16} /> Configure 2FA
                                        </button>
                                        <div className="my-1 border-t border-gray-100 dark:border-slate-800"></div>
                                        <a
                                            href="/"
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2"
                                        >
                                            <Undo size={16} /> Switch to Legacy Console
                                        </a>
                                        <div className="my-1 border-t border-gray-100 dark:border-slate-800"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                        >
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                    {/* Overlay */}
                                    <div
                                        className="fixed inset-0 z-40 bg-transparent"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto px-6 pb-6 pt-2">
                    <Outlet />
                    <footer className="mt-8 mb-4 border-t border-slate-200 dark:border-slate-800 pt-4 text-center">
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            <a href="https://technitium.com/dns/" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Technitium DNS Server</a> &copy; {new Date().getFullYear()}
                            <span className="mx-2">•</span>
                            Theme based on <a href="https://www.creative-tim.com/product/soft-ui-dashboard-tailwind" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Soft UI Dashboard</a> by Creative Tim (MIT License)
                        </p>
                    </footer>
                </main>
            </div>
        </div>
    );
};
