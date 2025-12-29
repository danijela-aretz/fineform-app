// Component to display on all client-facing pages to distinguish them from admin/staff pages
export default function ClientViewBanner() {
  return (
    <div className="bg-purple-50 border-b-2 border-purple-300 py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="badge bg-purple-600 text-white">CLIENT VIEW</span>
          <span className="text-sm text-purple-800">
            This is what clients see in the mobile app
          </span>
        </div>
        <span className="text-xs text-purple-600">
          Preview Mode
        </span>
      </div>
    </div>
  );
}

