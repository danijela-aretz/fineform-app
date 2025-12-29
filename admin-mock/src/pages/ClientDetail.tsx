import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tooltip } from 'primereact/tooltip';
import { mockEntities, statusColors, statusLabels } from '../data/mockData';
import HelpIcon from '../components/HelpIcon';

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const entity = mockEntities.find(e => e.id === id);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);

  if (!entity) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <HelpIcon />
        <div className="card">
          <p className="text-gray-500">Client not found</p>
          <Link to="/clients" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <HelpIcon />
      <div className="mb-6">
        <Link to="/clients" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
          ← Back to Clients
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{entity.entityName}</h1>
            <p className="mt-2 text-sm text-gray-600">
              {entity.accountName} • Tax Year {entity.taxYear}
            </p>
          </div>
          <Tooltip target=".client-experience-link" />
          <Link
            to={`/clients/${id}/status`}
            className="client-experience-link btn-primary border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700"
            data-pr-tooltip="Preview the complete client-facing experience for this entity"
            data-pr-position="top"
          >
            📱 View Client Experience
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Internal Status</span>
                <span className={`badge ${statusColors[entity.status] || 'bg-gray-100 text-gray-800'}`}>
                  {statusLabels[entity.status] || entity.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ready for Prep</span>
                {entity.readyForPrep ? (
                  <span className="badge badge-success">Ready</span>
                ) : (
                  <span className="badge badge-warning">Not Ready</span>
                )}
              </div>
              {entity.extensionRequested && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Extension</span>
                  {entity.extensionFiled ? (
                    <span className="badge badge-info">Filed</span>
                  ) : (
                    <span className="badge badge-warning">Requested</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Blocking Reasons */}
          {!entity.readyForPrep && entity.blockingReasons && entity.blockingReasons.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 text-red-600">Blocking Reasons</h2>
              <ul className="list-disc list-inside space-y-2">
                {entity.blockingReasons.map((reason, index) => (
                  <li key={index} className="text-sm text-gray-700">{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link to={`/clients/${id}/documents`} className="btn-secondary text-center">
                View Documents
              </Link>
              <Link to={`/clients/${id}/messages`} className="btn-secondary text-center">
                Messages
              </Link>
              <Link to={`/clients/${id}/notices`} className="btn-secondary text-center">
                Tax Notices
              </Link>
              <Link to={`/clients/${id}/profile`} className="btn-secondary text-center">
                Client Profile
              </Link>
              <Link to={`/clients/${id}/id-info`} className="btn-secondary text-center">
                ID Information
              </Link>
              <Link to={`/clients/${id}/action-needed`} className="btn-secondary text-center">
                Action Needed
              </Link>
              <Link to={`/clients/${id}/tax-returns`} className="btn-secondary text-center">
                Tax Returns
              </Link>
              <Link to={`/clients/${id}/permissions`} className="btn-secondary text-center">
                Permissions
              </Link>
              <div className="col-span-2 border-t pt-3 mt-3">
                <p className="text-xs text-gray-500 mb-2 font-medium">📱 Client View Previews (What clients see):</p>
              </div>
              <Tooltip target=".client-view-preview-link" />
              <Link 
                to={`/clients/${id}/questionnaire`} 
                className="client-view-preview-link btn-secondary text-center border-purple-200 bg-purple-50 hover:bg-purple-100"
                data-pr-tooltip="Preview the questionnaire interface as clients see it"
                data-pr-position="top"
              >
                📱 Questionnaire (Client View)
              </Link>
              <Link 
                to={`/clients/${id}/engagement-letter`} 
                className="client-view-preview-link btn-secondary text-center border-purple-200 bg-purple-50 hover:bg-purple-100"
                data-pr-tooltip="Preview the engagement letter signing interface as clients see it"
                data-pr-position="top"
              >
                📱 Engagement Letter (Client View)
              </Link>
              <Link 
                to={`/clients/${id}/checklist`} 
                className="client-view-preview-link btn-secondary text-center border-purple-200 bg-purple-50 hover:bg-purple-100"
                data-pr-tooltip="Preview the document checklist interface as clients see it"
                data-pr-position="top"
              >
                📱 Checklist (Client View)
              </Link>
              <Link 
                to={`/clients/${id}/document-receipt-confirmation`} 
                className="client-view-preview-link btn-secondary text-center border-purple-200 bg-purple-50 hover:bg-purple-100"
                data-pr-tooltip="Preview the document receipt confirmation interface as clients see it"
                data-pr-position="top"
              >
                📱 Doc Receipt Confirmation (Client View)
              </Link>
              <Link 
                to={`/clients/${id}/efile-authorization`} 
                className="client-view-preview-link btn-secondary text-center border-purple-200 bg-purple-50 hover:bg-purple-100"
                data-pr-tooltip="Preview the e-file authorization interface as clients see it"
                data-pr-position="top"
              >
                📱 E-File Authorization (Client View)
              </Link>
              <Link 
                to={`/clients/${id}/accountant-messages`} 
                className="client-view-preview-link btn-secondary text-center border-purple-200 bg-purple-50 hover:bg-purple-100"
                data-pr-tooltip="Preview the messaging interface as clients see it"
                data-pr-position="top"
              >
                📱 Accountant Messages (Client View)
              </Link>
              <Link 
                to={`/clients/${id}/status`} 
                className="client-view-preview-link btn-secondary text-center border-purple-200 bg-purple-50 hover:bg-purple-100"
                data-pr-tooltip="Preview the status view interface as clients see it"
                data-pr-position="top"
              >
                📱 Status View (Client View)
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Entity Info */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Entity Information</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>
                <span className="ml-2 font-medium">{entity.entityType}</span>
              </div>
              <div>
                <span className="text-gray-600">Account:</span>
                <span className="ml-2 font-medium">{entity.accountName}</span>
              </div>
              <div>
                <span className="text-gray-600">Tax Year:</span>
                <span className="ml-2 font-medium">{entity.taxYear}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
              {entity.readyForPrep && (
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="btn-primary w-full text-sm"
                >
                  Transition Status
                </button>
              )}
              <button
                onClick={() => setShowAuditLog(true)}
                className="btn-secondary w-full text-sm"
              >
                View Audit Log
              </button>
              <Link
                to={`/clients/${id}/permissions`}
                className="btn-secondary w-full text-sm text-center block"
              >
                Manage Permissions
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Status Transition Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Transition Status</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Status
              </label>
              <div className="p-2 bg-gray-50 rounded-md text-sm">
                {statusLabels[entity.status] || entity.status}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status *
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option>in_preparation</option>
                <option>in_review</option>
                <option>ready_to_file</option>
                <option>filed</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
                placeholder="Add a reason for this status change..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowStatusModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Status transitioned successfully!');
                  setShowStatusModal(false);
                }}
                className="btn-primary"
              >
                Transition Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {showAuditLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Audit History</h2>
            <div className="mb-4">
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm">
                  Status Changes
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm">
                  Permissions
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm">
                  Documents
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Old Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      New Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Changed By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Jan 15, 2024 10:00 AM
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      waiting_on_documents
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      in_preparation
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Admin User
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      All documents received
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Jan 10, 2024 09:00 AM
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      not_started
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      waiting_on_documents
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      System
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      Checklist created
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowAuditLog(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

