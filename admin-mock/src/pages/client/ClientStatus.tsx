import { useParams, Link } from 'react-router-dom';
import { mockEntities } from '../../data/mockData';
import HelpIcon from '../../components/HelpIcon';
import ClientViewBanner from '../../components/ClientViewBanner';

const clientStatuses = {
  SIGN_ENGAGEMENT: {
    label: 'Sign Engagement Letter',
    description: 'Please sign the engagement letter to begin your tax preparation.',
    color: 'blue',
    action: 'engagement-letter',
  },
  UPLOAD_DOCUMENTS: {
    label: 'Upload Documents',
    description: 'Please upload your tax documents using the Tax Document Checklist.',
    color: 'yellow',
    action: 'checklist',
  },
  CONFIRM_DOCUMENTS: {
    label: 'Confirm Documents',
    description: 'Please confirm receipt of your uploaded documents (optional).',
    color: 'yellow',
    action: 'document-receipt-confirmation',
  },
  IN_REVIEW: {
    label: 'In Review',
    description: 'Your tax return is being reviewed by our team.',
    color: 'purple',
    action: null,
  },
  SIGN_EFILE: {
    label: 'Sign E-File Authorization',
    description: 'Please sign the e-file authorization to allow electronic filing.',
    color: 'green',
    action: 'efile-authorization',
  },
  FILED: {
    label: 'Filed',
    description: 'Your tax return has been filed successfully.',
    color: 'green',
    action: null,
  },
};

export default function ClientStatus() {
  const { id } = useParams<{ id: string }>();
  const entity = mockEntities.find(e => e.id === id);

  if (!entity) {
    return (
      <>
        <ClientViewBanner />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <HelpIcon />
        <HelpIcon />
          <div className="card">
            <p className="text-gray-500">Client not found</p>
            <Link to="/clients" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
              ← Back to Clients
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Determine client-facing status based on entity state
  let currentStatus: keyof typeof clientStatuses = 'UPLOAD_DOCUMENTS';
  if (!entity.checklistComplete) {
    currentStatus = 'UPLOAD_DOCUMENTS';
  } else if (!entity.questionnaireSubmitted) {
    currentStatus = 'CONFIRM_DOCUMENTS';
  } else if (entity.status === 'in_review') {
    currentStatus = 'IN_REVIEW';
  } else if (entity.status === 'ready_to_file') {
    currentStatus = 'SIGN_EFILE';
  } else if (entity.status === 'filed') {
    currentStatus = 'FILED';
  }

  const statusInfo = clientStatuses[currentStatus];

  const getStatusColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'purple':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'green':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusIcon = (color: string) => {
    switch (color) {
      case 'blue':
      case 'yellow':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'purple':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'green':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <ClientViewBanner />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="mb-6">
          <Link to={`/clients/${id}`} className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
            ← Back to Client Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Your Tax Return Status</h1>
          <p className="mt-2 text-sm text-gray-600">
            {entity.entityName} • Tax Year {entity.taxYear}
          </p>
        </div>

        {/* Status Banner */}
        <div className={`card border-2 ${getStatusColorClasses(statusInfo.color)}`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {getStatusIcon(statusInfo.color)}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">{statusInfo.label}</h2>
              <p className="text-sm mb-4">{statusInfo.description}</p>
              {statusInfo.action && (
                <Link
                  to={`/clients/${id}/${statusInfo.action}`}
                  className="btn-primary inline-block"
                >
                  Take Action
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="card mt-6">
          <h3 className="text-lg font-semibold mb-4">Status Timeline</h3>
          <div className="space-y-4">
            {Object.entries(clientStatuses).map(([key, status]) => {
              const isActive = key === currentStatus;
              const isCompleted = Object.keys(clientStatuses).indexOf(currentStatus) > Object.keys(clientStatuses).indexOf(key as keyof typeof clientStatuses);
              
              return (
                <div key={key} className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : isActive ? (
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <div className="h-3 w-3 rounded-full bg-white" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <div className="h-3 w-3 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={`font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {status.label}
                    </p>
                    <p className="text-sm text-gray-600">{status.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Information */}
        <div className="card mt-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            If you have questions about your tax return status or need assistance, please use the
            Accountant Messages and Documents section to contact our team.
          </p>
          <Link
            to={`/clients/${id}/accountant-messages`}
            className="btn-secondary inline-block"
          >
            Contact Your Accountant
          </Link>
        </div>
      </div>
    </>
  );
}

