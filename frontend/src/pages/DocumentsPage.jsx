import { useState } from 'react';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';

function DocumentsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 relative overflow-hidden -mt-24 pt-24">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-6xl mx-auto px-6 py-20 relative z-10">
        <h1 className="text-5xl font-bold text-white mb-4">
          Mes Documents
        </h1>
        <p className="text-gray-300 text-lg mb-12">
          Uploadez et gérez vos documents PDF, DOCX et TXT
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="bg-indigo-900/30 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6">Upload</h2>
            <DocumentUpload onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* Documents List Section */}
          <div>
            <DocumentList key={refreshKey} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentsPage;