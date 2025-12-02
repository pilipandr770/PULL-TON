import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Subscription from './pages/Subscription';
import Admin from './pages/Admin';
import Impressum from './pages/Impressum';
import Datenschutz from './pages/Datenschutz';
import AGB from './pages/AGB';
import Documentation from './pages/Documentation';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="subscription/*" element={<Subscription />} />
        <Route path="admin/*" element={<Admin />} />
        <Route path="impressum" element={<Impressum />} />
        <Route path="datenschutz" element={<Datenschutz />} />
        <Route path="agb" element={<AGB />} />
        <Route path="docs" element={<Documentation />} />
      </Route>
    </Routes>
  );
}

export default App;
