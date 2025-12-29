import { useState } from 'react';
import { Link } from 'react-router-dom';
import ClientViewBanner from '../components/ClientViewBanner';
import HelpIcon from '../components/HelpIcon';

// Mockup of what the client mobile app dashboard would look like
export default function ClientDashboardPreview() {
  const [hasActionNeeded] = useState(true);
  const [idStatus] = useState<'active' | 'action_required'>('action_required');
  const [questionnaireProgress] = useState({ completed: 5, total: 12 });
  const [checklistProgress] = useState({ received: 8, required: 10 });
  const [unreadMessages] = useState(2);
  const [noticesCount] = useState(1);

  return (
    <>
      <ClientViewBanner />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <HelpIcon />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Client Dashboard Preview</h1>
        <p className="mt-2 text-sm text-gray-600">
          This is what clients see in the mobile app - tiles only, no folder browsing
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Dashboard tiles are the client's navigation. Clients cannot browse internal folder trees.
            Dashboard order must match exactly: Action Needed, ID Status, Tax Questionnaire, Tax Document Checklist,
            Accountant Messages and Documents, IRS and State Tax Notices.
          </p>
        </div>
      </div>

      {/* Mobile View Container */}
      <div className="max-w-sm mx-auto bg-white rounded-lg shadow-lg p-4 border-2 border-gray-200">
        <div className="mb-4 text-center">
          <h2 className="text-lg font-semibold text-gray-900">John & Jane Smith</h2>
          <p className="text-sm text-gray-600">2023 Tax Year</p>
        </div>

        <div className="space-y-4">
          {/* 1. Action Needed */}
          {hasActionNeeded && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-red-900">Action Needed</h3>
                <span className="badge bg-red-500 text-white">2</span>
              </div>
              <p className="text-sm text-red-800 mb-2">
                You have 2 pending actions requiring your attention
              </p>
              <Link to="/clients/1/action-needed" className="block w-full bg-red-600 text-white rounded-md py-2 text-sm font-medium text-center">
                View Actions
              </Link>
            </div>
          )}

          {/* 2. ID Status */}
          <div className={`border-2 rounded-lg p-4 ${idStatus === 'active' ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">ID Status</h3>
              {idStatus === 'active' ? (
                <span className="badge badge-success">ID Active</span>
              ) : (
                <span className="badge badge-warning">ID Action Required</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {idStatus === 'active'
                ? 'Your ID is valid and up to date'
                : 'Please update your ID information'}
            </p>
            <Link to="/clients/1/id-info" className="block w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium text-center">
              {idStatus === 'active' ? 'View ID Info' : 'Update ID'}
            </Link>
          </div>

          {/* 3. Quick Actions: Tax Questionnaire */}
          <div className="border-2 border-gray-300 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Tax Questionnaire</h3>
              <span className="text-sm text-gray-600">
                {questionnaireProgress.completed}/{questionnaireProgress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(questionnaireProgress.completed / questionnaireProgress.total) * 100}%` }}
              />
            </div>
            <Link to="/clients/1/questionnaire" className="block w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium text-center">
              Continue Questionnaire
            </Link>
          </div>

          {/* 4. Tax Document Checklist */}
          <div className="border-2 border-gray-300 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Tax Document Checklist</h3>
              <span className="text-sm text-gray-600">
                {checklistProgress.received}/{checklistProgress.required}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${(checklistProgress.received / checklistProgress.required) * 100}%` }}
              />
            </div>
            <Link to="/clients/1/checklist" className="block w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium text-center">
              View Checklist
            </Link>
          </div>

          {/* 5. Accountant Messages and Documents */}
          <div className="border-2 border-gray-300 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Accountant Messages and Documents</h3>
              {unreadMessages > 0 && (
                <span className="badge bg-red-500 text-white">{unreadMessages}</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Messages, signature documents, firm-shared docs, and tax returns
            </p>
            <Link to="/clients/1/accountant-messages" className="block w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium text-center">
              Open Messages
            </Link>
          </div>

          {/* 6. IRS and State Tax Notices */}
          <div className="border-2 border-gray-300 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">IRS and State Tax Notices</h3>
              {noticesCount > 0 && (
                <span className="badge bg-yellow-500 text-white">{noticesCount}</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Upload and manage tax notices received from IRS/State
            </p>
            <Link to="/clients/1/notices" className="block w-full bg-blue-600 text-white rounded-md py-2 text-sm font-medium text-center">
              View Notices
            </Link>
          </div>
        </div>
      </div>

      {/* Key Rules Display */}
      <div className="mt-8 card">
        <h2 className="text-lg font-semibold mb-4">Client Dashboard Rules</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Dashboard tiles are the client's navigation (no menus, no folder browsing)</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Clients can only see what is surfaced on dashboard tiles</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>No access to: Accounting folders, Internal tax documents, Preparer returns</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Tile order must match exactly as shown above</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>Action Needed only shows for firm-requested, required actions</span>
          </li>
        </ul>
      </div>
    </div>
    </>
  );
}

