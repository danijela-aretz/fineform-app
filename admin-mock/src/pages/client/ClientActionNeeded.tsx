import { useParams, Link } from 'react-router-dom';
import { mockEntities, mockActionsNeeded } from '../../data/mockData';
import HelpIcon from '../../components/HelpIcon';
import ClientViewBanner from '../../components/ClientViewBanner';

export default function ClientActionNeeded() {
  const { id } = useParams<{ id: string }>();
  const entity = mockEntities.find(e => e.id === id);
  const entityActions = mockActionsNeeded.filter(a => a.entityId === id);

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

  const getActionTypeColor = (type: string) => {
    switch (type) {
      case 'sign_engagement_letter':
        return 'bg-blue-100 text-blue-800';
      case 'sign_efile_authorization':
        return 'bg-green-100 text-green-800';
      case 'checklist_incomplete':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionTypeLabel = (type: string) => {
    switch (type) {
      case 'sign_engagement_letter':
        return 'Engagement Letter';
      case 'sign_efile_authorization':
        return 'E-File Authorization';
      case 'checklist_incomplete':
        return 'Missing Documents';
      default:
        return type;
    }
  };

  return (
    <>
      <ClientViewBanner />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <HelpIcon />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to={`/clients/${id}`} className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
            ← Back to Client
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Action Needed</h1>
          <p className="mt-2 text-sm text-gray-600">
            {entity.entityName} • {entity.taxYear}
          </p>
        </div>
        <button className="btn-primary">Create Action Item</button>
      </div>

      <div className="space-y-4">
        {entityActions.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No pending actions for this client.</p>
          </div>
        ) : (
          entityActions.map((action) => (
            <div key={action.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`badge ${getActionTypeColor(action.actionType)}`}>
                      {getActionTypeLabel(action.actionType)}
                    </span>
                    {action.status === 'pending' && (
                      <span className="badge badge-warning">Pending</span>
                    )}
                    {action.status === 'completed' && (
                      <span className="badge badge-success">Completed</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {action.description}
                  </p>
                  {action.dueDate && (
                    <p className="text-xs text-gray-500">
                      Due: {new Date(action.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary text-sm">View Details</button>
                  <button className="btn-secondary text-sm">Mark Complete</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </>
  );
}

