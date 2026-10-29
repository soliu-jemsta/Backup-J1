import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./LandingPage/LandingPage";
import LandlordDashboard from "./Landlord/Dashboard/LandlordDashboard";
import Properties from "./Landlord/Properties/Properties";
import DashboardLayout from "./assets/Layouts/DashboardLayout";
import PropertyDetails from "./Landlord/Properties/PropertyDetails";
import Tenants from "./Landlord/Tenant/Tenants";
import TenantDetails from "./Landlord/Tenant/TenantDetails";
import FinancialOverview from "./Landlord/Finance/FinancialOverview";

import TenantDashboard from "./Tenant/Dashboard/TenantDashboard";
import RentPayment from "./Tenant/RentPayment/RentPayment";
import MaintenanceRequests from "./Tenant/Maintenance/MaintenanceRequests";
import TenantDocuments from "./Tenant/Documents/Documents";
import TenantMessages from "./Tenant/Messages/Messages";
import LandlordLogin from "./pages/LandlordLogin";
import TenantLogin from "./pages/TenantLogin";
import PrivateRoute from "./components/PrivateRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import { AuthProvider as PublicAuthProvider } from "./contextP/AuthContext";

import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./assets/Layouts/AdminLayout";
import AdminDashboard from "./Admin/Dashboard/AdminDashboard";
import Users from "./Admin/RolesAndUsers/Users";
import Roles from "./Admin/RolesAndUsers/Roles";
import LandlordDetail from "./Admin/Landlords/LandlordDetail";
import Landlords from "./Admin/Landlords/Landlords";
import Projects from "./Admin/Projects/Projects";
import ProjectDetail from "./Admin/Projects/ProjectDetail";
import AdminTenants from "./Admin/Tenants/Tenants";
import TenantDetail from "./Admin/Tenants/TenantDetail";
import Property from "./Admin/Property/Property";
import PropertyDetail from "./Admin/Property/PropertyDetail";
import PropertyCategory from "./Admin/Property/PropertyCategory";
import PropertyFacilityType from "./Admin/Property/PropertyFacilityType";
import MaintenanceInvoice from "./Admin/Remittance/MaintenanceInvoice";
import MonthlyRemittance from "./Admin/Remittance/MonthlyRemittance";
import TenantInvoice from "./Admin/Remittance/TenantInvoice";
import { ToastProvider } from "./Admin/shared/ToastProvider";
import LandingLayout from "./assets/Layouts/LandingLayout";
import Contact from "./pages/Contact";
import BookOnline from "./pages/BookOnline";
import About from "./pages/About";
import ExploreSales from "./LandingPage/PropertyListings/ExploreSales";
import ExploreRent from "./LandingPage/PropertyListings/ExploreRent";
import PublicPropertyDetail from "./LandingPage/PropertyListings/PropertyDetail";
import TawkComponent from "./TawkComponent";

import TarrifDetail from "./pages/TarrifDetail";
import AuditLog from "./Admin/Audit/AuditLog";



function App() {
  return (
    <ErrorBoundary>
    <ToastProvider>
      <AuthProvider>
        <PublicAuthProvider>
        <BrowserRouter>
          <Routes>

            {/* Landing Page (Standalone) */}
            <Route path="/" element={<LandingLayout />}>  
              <Route index element={<LandingPage />} />
              <Route path="contact" element={<Contact />} />
              <Route path="bookonline" element={<BookOnline />} />
              <Route path="about" element={<About />} />
              <Route path='sales' element={<ExploreSales />} />
              <Route path='rent' element={<ExploreRent />} />
              <Route path="tarrif" element={<TarrifDetail />} />
              <Route path="/property/:id" element={<PublicPropertyDetail />} />
              
            </Route>
            
            {/* <Route path="/" element={<LandingPage />} /> */}
            <Route path="/login/landlord" element={<LandlordLogin />} />
            <Route path="/login/tenant" element={<TenantLogin />} />
            <Route path="/login/admin" element={<AdminLogin />} />

            {/* Dashboard Layout Wrapper */}
            <Route path="/landlord" element={<PrivateRoute Component={DashboardLayout} requiredRole="landlord" />}>
              
              <Route index element={<LandlordDashboard />} />
              <Route path="properties" element={<Properties />} />
              <Route path="properties/:propertyId" element={<PropertyDetails />} />
              <Route path="tenants" element={<Tenants />} />
              <Route path="tenants/:tenantId" element={<TenantDetails />} />
              <Route path="finance" element={<FinancialOverview />} />
            </Route>

            {/* TENANT PORTAL */}
            <Route path="/tenant" element={<PrivateRoute Component={DashboardLayout} requiredRole="tenant" />}>
              <Route index element={<TenantDashboard />} />
              <Route path="rent-payment" element={<RentPayment />} />
              <Route path="maintenance" element={<MaintenanceRequests />} />
              <Route path="documents" element={<TenantDocuments />} />
              <Route path="messages" element={<TenantMessages />} />
            </Route>

            {/* Admin center */}
            <Route path="/admin" element={<PrivateRoute Component={AdminLayout} requiredRole="admin" />}>
              {/* <Route index element={<Dashboard />} /> */}
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="roles" element={<Roles />} />
              <Route path="landlords" element={<Landlords />} />
              <Route path="landlords/:landlordId" element={<LandlordDetail />} />
              <Route path="tenants" element={<AdminTenants />} />
              <Route path="tenants/:tenantId" element={<TenantDetail />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:projectId" element={<ProjectDetail />} />
              <Route path="property" element={<Property />} />
              <Route path="property/:propertyId" element={<PropertyDetail />} />
              <Route path="property-category" element={<PropertyCategory />} />
              <Route path="property-facility-type" element={<PropertyFacilityType />} />
              <Route path="maintenance-invoice" element={<MaintenanceInvoice />} />
              <Route path="monthly-remittance" element={<MonthlyRemittance />} />
              <Route path="tenant-invoice" element={<TenantInvoice />} />
              <Route path="audit-log" element={<AuditLog />} />
            </Route>
          </Routes>
          <TawkComponent />
        </BrowserRouter>
        </PublicAuthProvider>
      </AuthProvider>
    </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;