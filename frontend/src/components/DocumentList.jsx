import { useState, useEffect } from 'react';
import { FileText, Trash2, Download, RefreshCw } from 'lucide-react';
import { documentsAPI } from '../services/api';

function DocumentList({ onDocumentChange }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await documentsAPI.getDocumentsMetadata();
      setDocuments(response.data);
    } catch (err) {
      setError('Impossible de charger les documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (documentId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;

    try {
      await documentsAPI.deleteDocument(documentId);
      setDocuments(documents.filter(doc => doc.id !== documentId));
      if (onDocumentChange) onDocumentChange();
    } catch (err) {
      alert('Erreur lors de la suppression du document');
      console.error(err);
    }
  };

  const handleDownload = async (documentId, fileName) => {
    try {
      const response = await documentsAPI.getDocumentFile(documentId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Erreur lors du téléchargement du document');
      console.error(err);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="bg-indigo-900/30 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-center gap-3 text-cyan-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <p>Chargement des documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
        <p className="text-red-300">{error}</p>
        <button
          onClick={fetchDocuments}
          className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-indigo-900/30 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-12 shadow-xl text-center">
        <FileText className="w-16 h-16 text-cyan-400/50 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          Aucun document
        </h3>
        <p className="text-gray-400">
          Uploadez votre premier document pour commencer
        </p>
      </div>
    );
  }

  return (
    <div className="bg-indigo-900/30 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          Mes Documents ({documents.length})
        </h2>
        <button
          onClick={fetchDocuments}
          className="p-2 hover:bg-cyan-500/20 rounded-lg transition-colors group"
          title="Actualiser"
        >
          <RefreshCw className="w-5 h-5 text-cyan-400 group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-indigo-900/40 border border-cyan-500/20 rounded-xl p-4 hover:border-cyan-500/40 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="bg-cyan-500/20 p-3 rounded-lg flex-shrink-0">
                  <FileText className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">
                    {doc.file_name || 'Document'}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>{formatFileSize(doc.size)}</span>
                    {doc.date && <span>• {doc.date}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDownload(doc.id, doc.file_name)}
                  className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                  title="Télécharger"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DocumentList;
