import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Verlof from './pages/Mijn-verlof.jsx';
import Aanvragen from './pages/Aanvragen.jsx';
import Kalender from './pages/Kalender.jsx';
import Teamoverzicht from './pages/Teamoverzicht.jsx';
import Instellingen from './pages/Instellingen.jsx';

function App() {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="verlof" element={<Verlof />} />
                <Route path="aanvragen" element={<Aanvragen />} />
                <Route path="kalender" element={<Kalender />} />
                <Route path="teamoverzicht" element={<Teamoverzicht />} />
                <Route path="instellingen" element={<Instellingen />} />
            </Route>
        </Routes>
    );
}

export default App;