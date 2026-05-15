import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

import RequirePermission from "../guards/RequirePermission";
import { ROUTE_PERMISSIONS } from "../config/permissions";
import AppLayout from "../components/layout/AppLayout";
import AgencyCollaborations from "../compnent/collaborations/Collaborations";
import AgencyCollaborationDetails from "../compnent/collaborations/CollaborationDetails";
import AgencyCommissions from "../compnent/commissions/AgencyCommissions";
import Dashboard from "../compnent/dashboard/Dashboard";
import AgencyInvoices from "../compnent/invoices/AgencyInvoices";
import MessagingCenter from "../compnent/messaging/MessagingCenter";
import CreateOffer from "../compnent/offers/CreateOffer";
import EditOffer from "../compnent/offers/EditOffer";
import ListOffers from "../compnent/offers/indexOffers";
import OfferDetails from "../compnent/offers/OfferDetails";
import MyWallet from "../compnent/wallet/MyWallet";
import Marketplace from "./Marketplace";
import OrdersPage from "./OrdersPage";
import ProfilePage from "./ProfilePage";
import SettingsPage from "./SettingsPage";
import TeamUsersPage from "./TeamUsersPage";


const AppConfirmation = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      const tablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsTablet(tablet);

      if (mobile || tablet) {
        setSidebarOpen(false);
      } else {
        const savedState = localStorage.getItem("sidebarOpen");
        setSidebarOpen(savedState !== null ? JSON.parse(savedState) : true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile && !isTablet) {
      localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
    }
  }, [sidebarOpen, isMobile, isTablet]);

  return (
    <AppLayout
      sidebarOpen={sidebarOpen}
      isMobile={isMobile}
      isTablet={isTablet}
      onCloseSidebar={() => setSidebarOpen(false)}
      onToggleSidebar={() => setSidebarOpen((previous) => !previous)}
    >
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/marketplace" element={<Protected anyOf={["offers.view_marketplace", "offers.view"]}><Marketplace /></Protected>} />
        <Route path="/offers" element={<Protected anyOf={ROUTE_PERMISSIONS.offers}><ListOffers /></Protected>} />
        <Route path="/orders" element={<Protected anyOf={ROUTE_PERMISSIONS.orders}><OrdersPage /></Protected>} />
        <Route path="/create-offer" element={<Protected anyOf={["offers.create"]}><CreateOffer /></Protected>} />
        <Route path="/edit-offer/:id" element={<Protected anyOf={["offers.update", "offers.update_own", "offers.update_agency"]}><EditOffer /></Protected>} />
        <Route path="/offer/:id" element={<Protected anyOf={ROUTE_PERMISSIONS.offers}><OfferDetails /></Protected>} />
        <Route path="/collaborations" element={<Protected anyOf={ROUTE_PERMISSIONS.collaborations}><AgencyCollaborations /></Protected>} />
        <Route path="/collaboration/:id" element={<Protected anyOf={ROUTE_PERMISSIONS.collaborations}><AgencyCollaborationDetails /></Protected>} />
        <Route path="/wallet" element={<Protected anyOf={ROUTE_PERMISSIONS.wallet}><MyWallet /></Protected>} />
        <Route path="/commissions" element={<Protected anyOf={ROUTE_PERMISSIONS.commissions}><AgencyCommissions /></Protected>} />
        <Route path="/invoices" element={<Protected anyOf={ROUTE_PERMISSIONS.invoices}><AgencyInvoices /></Protected>} />
        <Route path="/messages" element={<Protected anyOf={ROUTE_PERMISSIONS.messages}><MessagingCenter /></Protected>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/team" element={<Protected anyOf={ROUTE_PERMISSIONS.team}><TeamUsersPage /></Protected>} />
      </Routes>
    </AppLayout>
  );
};

const Protected = ({ anyOf, children }) => (
  <RequirePermission anyOf={anyOf}>{children}</RequirePermission>
);

export default AppConfirmation;
