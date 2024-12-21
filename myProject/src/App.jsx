import React from 'react';
import { BrowserRouter, Route , Routes} from 'react-router-dom';
import HomePage from './pages/Home';
import RoleSelection from './pages/RoleSelection';
import RecyclePlant from './pages/RecyclePlant';
import FundProvider from './pages/FundProvider';
import FundProviderDashBoard from './pages/FundProviderDashBoard';
function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/"  element={<HomePage/>} />
      <Route path="/join" element={<RoleSelection/>} />
      <Route path="/RecyclePlant" element={<RecyclePlant/>} />
      <Route path="/FundProvider" element={<FundProvider/>} />
      <Route path="/FundProviderDashBoard" element={<FundProviderDashBoard/>} />
    </Routes>
    </BrowserRouter>
    
  );
}

export default App;
