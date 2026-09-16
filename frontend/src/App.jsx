import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

function App() {
    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow p-4 flex gap-4">
                <Link to="/" className="text-blue-500 font-semibold hover:underline">Home</Link>
                <Link to="/dashboard" className="text-blue-500 font-semibold hover:underline">Dashboard</Link>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </div>
    );
}

export default App;