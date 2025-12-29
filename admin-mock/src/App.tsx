import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import ClientDocuments from './pages/client/ClientDocuments';
import ClientMessages from './pages/client/ClientMessages';
import ClientNotices from './pages/client/ClientNotices';
import ClientProfile from './pages/client/ClientProfile';
import ClientIdInfo from './pages/client/ClientIdInfo';
import ClientActionNeeded from './pages/client/ClientActionNeeded';
import ClientTaxReturns from './pages/client/ClientTaxReturns';
import ClientPermissions from './pages/client/ClientPermissions';
import ClientQuestionnaire from './pages/client/ClientQuestionnaire';
import ClientEngagementLetter from './pages/client/ClientEngagementLetter';
import ClientChecklist from './pages/client/ClientChecklist';
import ClientDocumentReceiptConfirmation from './pages/client/ClientDocumentReceiptConfirmation';
import ClientEfileAuthorization from './pages/client/ClientEfileAuthorization';
import ClientAccountantMessages from './pages/client/ClientAccountantMessages';
import ClientStatus from './pages/client/ClientStatus';
import Accounts from './pages/Accounts';
import Entities from './pages/Entities';
import Users from './pages/Users';
import QuestionnaireBuilder from './pages/QuestionnaireBuilder';
import Invites from './pages/Invites';
import Checklist from './pages/Checklist';
import Permissions from './pages/Permissions';
import Extensions from './pages/Extensions';
import TaxReturns from './pages/TaxReturns';
import ActionNeeded from './pages/ActionNeeded';
import Messages from './pages/Messages';
import Notices from './pages/Notices';
import BulkImport from './pages/BulkImport';
import DocumentReview from './pages/DocumentReview';
import EngagementLetter from './pages/EngagementLetter';
import EfileAuthorization from './pages/EfileAuthorization';
import DocumentReceiptConfirmation from './pages/DocumentReceiptConfirmation';
import IdInformationManagement from './pages/IdInformationManagement';
import EmailDeliveryLog from './pages/EmailDeliveryLog';
import Reminders from './pages/Reminders';
import FolderManagement from './pages/FolderManagement';
import AuditLog from './pages/AuditLog';
import ClientDashboardPreview from './pages/ClientDashboardPreview';
import AccountDetail from './pages/AccountDetail';
import EntityDetail from './pages/EntityDetail';
import UserDetail from './pages/UserDetail';
import Login from './pages/Login';
import NotificationsPage from './pages/NotificationsPage';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import HelpSidebar from './components/HelpSidebar';
import { HelpProvider } from './contexts/HelpContext';

function App() {
  return (
    <BrowserRouter>
      <HelpProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main>
            <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
            <Route path="/clients/:id/documents" element={<ClientDocuments />} />
            <Route path="/clients/:id/messages" element={<ClientMessages />} />
            <Route path="/clients/:id/notices" element={<ClientNotices />} />
            <Route path="/clients/:id/profile" element={<ClientProfile />} />
            <Route path="/clients/:id/id-info" element={<ClientIdInfo />} />
            <Route path="/clients/:id/action-needed" element={<ClientActionNeeded />} />
            <Route path="/clients/:id/tax-returns" element={<ClientTaxReturns />} />
            <Route path="/clients/:id/permissions" element={<ClientPermissions />} />
            <Route path="/clients/:id/questionnaire" element={<ClientQuestionnaire />} />
            <Route path="/clients/:id/engagement-letter" element={<ClientEngagementLetter />} />
            <Route path="/clients/:id/checklist" element={<ClientChecklist />} />
            <Route path="/clients/:id/document-receipt-confirmation" element={<ClientDocumentReceiptConfirmation />} />
            <Route path="/clients/:id/efile-authorization" element={<ClientEfileAuthorization />} />
            <Route path="/clients/:id/accountant-messages" element={<ClientAccountantMessages />} />
            <Route path="/clients/:id/status" element={<ClientStatus />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/accounts/:id" element={<AccountDetail />} />
            <Route path="/entities" element={<Entities />} />
            <Route path="/entities/:id" element={<EntityDetail />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/invites" element={<Invites />} />
            <Route path="/checklist" element={<Checklist />} />
            <Route path="/questionnaire" element={<QuestionnaireBuilder />} />
            <Route path="/tax-returns" element={<TaxReturns />} />
            <Route path="/extensions" element={<Extensions />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/action-needed" element={<ActionNeeded />} />
            <Route path="/notices" element={<Notices />} />
            <Route path="/permissions" element={<Permissions />} />
            <Route path="/bulk-import" element={<BulkImport />} />
            <Route path="/document-review" element={<DocumentReview />} />
            <Route path="/engagement-letter" element={<EngagementLetter />} />
            <Route path="/efile-authorization" element={<EfileAuthorization />} />
            <Route path="/document-receipt-confirmation" element={<DocumentReceiptConfirmation />} />
            <Route path="/id-information" element={<IdInformationManagement />} />
            <Route path="/email-delivery-log" element={<EmailDeliveryLog />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/folder-management" element={<FolderManagement />} />
            <Route path="/audit-log" element={<AuditLog />} />
            <Route path="/client-dashboard-preview" element={<ClientDashboardPreview />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
          <HelpSidebar />
        </div>
      </HelpProvider>
    </BrowserRouter>
  );
}

export default App;
