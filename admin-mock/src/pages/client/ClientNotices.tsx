import { useParams, Link } from 'react-router-dom';
import { mockEntities, mockNotices } from '../../data/mockData';
import HelpIcon from '../../components/HelpIcon';
import ClientViewBanner from '../../components/ClientViewBanner';

export default function ClientNotices() {
  const { id } = useParams<{ id: string }>();
  const entity = mockEntities.find(e => e.id === id);
  const entityNotices = mockNotices.filter(n => n.entityId === id);

  if (!entity) {
    return (
      <>
        <ClientViewBanner />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'waiting_on_you':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
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
          <h1 className="text-3xl font-bold text-gray-900">IRS and State Tax Notices</h1>
          <p className="mt-2 text-sm text-gray-600">
            {entity.entityName} • {entity.taxYear}
          </p>
        </div>
        <button className="btn-primary">Create Notice</button>
      </div>

      <div className="space-y-4">
        {entityNotices.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No tax notices for this client.</p>
          </div>
        ) : (
          entityNotices.map((notice) => (
            <div key={notice.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`badge ${notice.agency === 'irs' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                      {notice.agency.toUpperCase()}
                    </span>
                    <span className={`badge ${getStatusColor(notice.status)}`}>
                      {getStatusLabel(notice.status)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Tax Year {notice.taxYear}
                    {notice.noticeNumber && ` - Notice ${notice.noticeNumber}`}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(notice.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary text-sm">Upload Document</button>
                  <button className="btn-primary text-sm">Update Status</button>
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

