// components/Sidebar.jsx
import {
    Home,
    FileText,
    Clock,
    Calendar,
    Users,
    BarChart2,
    Settings
} from 'lucide-react';

export default function Sidebar() {
    return (
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-[calc(100vh-4rem)] p-4 space-y-2">
            <a
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-orange-50 text-[#FF7A00] font-medium transition-colors"
            >
                <Home size={20} />
                <span>Dashboard</span>
            </a>

            <a
                href="/verlof"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
                <FileText size={20} />
                <span>Mijn verlof</span>
            </a>

            <a
                href="/aanvragen"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
                <Clock size={20} />
                <span>Aanvragen</span>
            </a>

            <a
                href="/kalender"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
                <Calendar size={20} />
                <span>Kalender</span>
            </a>

            <a
                href="/teamoverzicht"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
                <Users size={20} />
                <span>Teamoverzicht</span>
            </a>

            <a
                href="/rapportages"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
                <BarChart2 size={20} />
                <span>Rapportages</span>
            </a>

            <a
                href="/instellingen"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
                <Settings size={20} />
                <span>Instellingen</span>
            </a>
        </aside>
    );
}