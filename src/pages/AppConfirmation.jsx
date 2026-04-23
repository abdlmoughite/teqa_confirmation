// AppConfirmation.jsx
import { useContext, useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Saidbar from "../compnent/Saidbar";
import CreateOffer from "../compnent/offers/CreateOffer";
import ListOffers from "../compnent/offers/indexOffers";
import EditOffer from "../compnent/offers/EditOffer";
import OfferDetails from "../compnent/offers/OfferDetails";
import AgencyCollaborations from "../compnent/collaborations/Collaborations";
import AgencyCollaborationDetails from "../compnent/collaborations/CollaborationDetails";
import MyWallet from "../compnent/wallet/MyWallet";
import "./AppConfirmation.css";
import MyCommissions from "../compnent/commissions/MyCommissions";
import MyInvoices from "../compnent/invoices/MyInvoices";
import AgencyCommissions from "../compnent/commissions/AgencyCommissions";
import AgencyInvoices from "../compnent/invoices/AgencyInvoices";

const AppConfirmation = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const mainContentRef = useRef(null);

  // Détecter les changements de taille d'écran
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      const tablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsTablet(tablet);
      
      if (mobile || tablet) {
        setSidebarOpen(false);
      } else {
        const savedState = localStorage.getItem('sidebarOpen');
        setSidebarOpen(savedState !== null ? JSON.parse(savedState) : true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sauvegarder l'état de la sidebar dans localStorage (desktop uniquement)
  useEffect(() => {
    if (!isMobile && !isTablet) {
      localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
    }
  }, [sidebarOpen, isMobile, isTablet]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Calcul de la marge en fonction de l'état
  const getMarginLeft = () => {
    if (isMobile || isTablet) return 0;
    return sidebarOpen ? 224 : 64; // w-56 = 224px, w-16 = 64px
  };

  return (
    <div className="app-layout">
      {/* Overlay pour mobile/tablette */}
      {(isMobile || isTablet) && sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <Saidbar
        isOpen={sidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
        onClose={() => setSidebarOpen(false)}
        onToggle={toggleSidebar}
      />

      <main 
        ref={mainContentRef}
        className="main-content"
        style={{
          marginLeft: `${getMarginLeft()}px`,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          width: `calc(100% - ${getMarginLeft()}px)`,
          minHeight: '100vh',
        }}
      >
        <div className="content-wrapper">
          <div className="content-area">
            <Routes>
              <Route path="/offers" element={<ListOffers />} />
              <Route path="/create-offer" element={<CreateOffer />} />
              <Route path="/edit-offer/:id" element={<EditOffer />} />
              <Route path="/offer/:id" element={<OfferDetails />} />
              <Route path="/collaborations" element={<AgencyCollaborations />} />
              <Route path="/collaboration/:id" element={<AgencyCollaborationDetails />} />
              <Route path="/wallet" element={<MyWallet />} />
              {/* <Route path="/commissions" element={<MyCommissions />} />
              <Route path="/invoices" element={<MyInvoices />} /> */}
              <Route path="/commissions" element={<AgencyCommissions />} />
<Route path="/invoices" element={<AgencyInvoices />} />
              <Route path="/" element={<Navigate to="/offers" replace />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppConfirmation;