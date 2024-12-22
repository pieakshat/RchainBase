import React from 'react';
import { BrowserRouter, Route , Routes} from 'react-router-dom';
import HomePage from './pages/Home';
import RoleSelection from './pages/RoleSelection';
import RecyclePlant from './pages/RecyclePlant';
import FundProvider from './pages/FundProvider';
import FundProviderDashBoard from './pages/FundProviderDashBoard';
import PlantDashboard from './pages/PlantsDashBoard';
import { WalletProvider } from './context/walletContext';
import CompanyList from './components/CompanyList';

function App() {
  return (
    <WalletProvider>
    <BrowserRouter>
    <Routes>
      <Route path="/"  element={<HomePage/>} />
      <Route path="/join" element={<RoleSelection/>} />
      <Route path="/RecyclePlant" element={<RecyclePlant/>} />
      <Route path="/FundProvider" element={<FundProvider/>} />
      <Route path="/FundProviderDashBoard" element={<FundProviderDashBoard/>} />
      <Route path="/PlantDashboard" element={<PlantDashboard/>} />
      <Route path="/CompanyList" element={<CompanyList/>} />
    </Routes>
    </BrowserRouter>
    </WalletProvider>
    
  );
}

export default App;
