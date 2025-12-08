import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/DashboardPage";
import Scanner from "./pages/ScannerPage";
import Login from "./pages/Login";
import InventoryListPage from "./pages/InventoryListPage";
import InventoryForm from "./pages/InventoryFormPage";
import InventoryDetailPage from "./pages/InventoryDetailPage";
import EditItemPage from "./pages/EditItemPage";
import MovementsHistoryPage from "./pages/MovementsHistoryPage";
import MovementDetailPage from "./pages/MovementDetailPage";
import AlertsPage from "./pages/AlertsHistoryPage";
import QuotationPage from "./pages/QuotationPage";
import QuotationPDFView from "./pages/QuotationPDFView";
import QuotationsHistoryPage from "./pages/QuotationsHistoryPage";
import QuotationDetailPage from "./pages/QuotationDetailPage";
import EditQuotationPage from "./pages/EditQuotationPage";
import ReporteRepuestosPage from "./pages/ReporteRepuestosPage";
import Profiles from "./pages/Profiles";
import AlertSettingsPage from "./pages/AlertSettingsPage";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Login />} />
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/scanner"
          element={
            <PrivateRoute>
              <Scanner />
            </PrivateRoute>
          }
        />

        <Route
          path="/inventario"
          element={
            <PrivateRoute>
              <InventoryListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventario/:id"
          element={
            <PrivateRoute>
              <InventoryDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventario/nuevo"
          element={
            <PrivateRoute>
              <InventoryForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventario/editar/:id"
          element={
            <PrivateRoute>
              <EditItemPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventario/movimientos"
          element={
            <PrivateRoute>
              <MovementsHistoryPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventario/movimientos/:id/:tipo"
          element={
            <PrivateRoute>
              <MovementDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/alertas"
          element={
            <PrivateRoute>
              <AlertsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/alertas/configuracion"
          element={
            <PrivateRoute>
              <AlertSettingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/cotizacion"
          element={
            <PrivateRoute>
              <QuotationPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/cotizaciones/editar/:id"
          element={
            <PrivateRoute>
              <EditQuotationPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/cotizacion/:id"
          element={
            <PrivateRoute>
              <QuotationDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/cotizacion/pdf/:id"
          element={
            <PrivateRoute>
              <QuotationPDFView />
            </PrivateRoute>
          }
        />
        <Route
          path="/historial-cotizaciones"
          element={
            <PrivateRoute>
              <QuotationsHistoryPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/reportes/repuestos-usados"
          element={
            <PrivateRoute>
              <ReporteRepuestosPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <PrivateRoute>
              <Profiles />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
