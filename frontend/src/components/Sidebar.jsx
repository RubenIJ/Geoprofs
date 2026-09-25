// components/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    FileText,
    Clock,
    Calendar,
    Users,
    Settings
} from 'lucide-react';

export default function Sidebar() {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const linkClass = (path) => `
        flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors
        ${isActive(path)
            ? 'bg-orange-50 text-[#FF7A00]'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
    `;

    return (
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-[calc(100vh-4rem)] p-4 space-y-2">
            <Link to="/" className={linkClass('/')}>
                <Home size={20} />
                <span>Dashboard</span>
            </Link>

            <Link to="/verlof" className={linkClass('/verlof')}>
                <FileText size={20} />
                <span>Mijn verlof</span>
            </Link>

            <Link to="/aanvragen" className={linkClass('/aanvragen')}>
                <Clock size={20} />
                <span>Aanvragen</span>
            </Link>

            <Link to="/kalender" className={linkClass('/kalender')}>
                <Calendar size={20} />
                <span>Kalender</span>
            </Link>

            <Link to="/teamoverzicht" className={linkClass('/teamoverzicht')}>
                <Users size={20} />
                <span>Teamoverzicht</span>
            </Link>

            <Link to="/instellingen" className={linkClass('/instellingen')}>
                <Settings size={20} />
                <span>Instellingen</span>
            </Link>
        </aside>
    );
}