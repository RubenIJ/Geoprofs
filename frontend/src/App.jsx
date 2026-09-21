import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import Home from './pages/Home.jsx';

function App() {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                {/* Home is het kind dat in de <Outlet /> getoond wordt op de homepage */}
                <Route index element={<Home />} />
            </Route>
        </Routes>
    );
}

export default App;