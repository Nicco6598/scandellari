import React from 'react';
import { Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
// Potresti importare qui anche componenti comuni dell'admin, tipo Sidebar o NavbarAdmin
// import Sidebar from './Sidebar'; 
// import NavbarAdmin from './NavbarAdmin';

const AdminLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      {/* Qui puoi aggiungere la struttura comune delle pagine admin */}
      <div className="admin-layout">
        {/* Esempio: <Sidebar /> */}
        <main className="admin-content">
          {/* <NavbarAdmin /> */}
          {/* Outlet renderizzerà il componente della rotta figlia corrispondente */}
          <Outlet /> 
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default AdminLayout; 
