import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { documentsAPI } from '../services/api';

function DocumentUpload({ onUploadSuccess }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error' | null

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
    }));
    setFiles((prev) => [...prev, ...newFiles]);
    setUploadStatus(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
  });

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      files.forEach((fileObj) => {
        formData.append('files', fileObj.file);
      });

      const response = await documentsAPI.uploadDocument(formData);

      setUploadStatus('success');
      setFiles([]);

      // Notifier le parent que l'upload est réussi
      if (onUploadSuccess) {
        onUploadSuccess();
      }

      setTimeout(() => {
        setUploadStatus(null);
      }, 3000);

      console.log('Upload success:', response.data);
    } catch (error) {
      setUploadStatus('error');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-cyan-500 bg-cyan-500/10'
            : 'border-cyan-500/30 bg-indigo-900/20 hover:border-cyan-500/60 hover:bg-indigo-900/30'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className="bg-gradient-to-br from-cyan-400 to-blue-600 p-6 rounded-2xl shadow-lg shadow-cyan-500/30">
            <Upload className="w-12 h-12 text-white" />
          </div>
          <div>
            <p className="text-xl text-white font-semibold mb-2">
              {isDragActive
                ? 'Déposez vos fichiers ici...'
                : 'Glissez-déposez vos documents'}
            </p>
            <p className="text-gray-400">
              ou cliquez pour sélectionner des fichiers
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Formats acceptés: PDF, DOCX, TXT
            </p>
          </div>
        </div>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">
            Fichiers sélectionnés ({files.length})
          </h3>
          <div className="space-y-2">
            {files.map((fileObj) => (
              <div
                key={fileObj.id}
                className="bg-indigo-900/30 border border-cyan-500/20 rounded-xl p-4 flex items-center justify-between hover:border-cyan-500/40 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {fileObj.file.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {formatFileSize(fileObj.file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(fileObj.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  disabled={uploading}
                >
                  <X className="w-5 h-5 text-red-400" />
                </button>
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-3 rounded-xl font-semibold shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {uploading ? 'Upload en cours...' : `Uploader ${files.length} fichier${files.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {/* Status Messages */}
      {uploadStatus === 'success' && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-400" />
          <div>
            <p className="text-green-300 font-semibold">Upload réussi!</p>
            <p className="text-sm text-green-400/80">Vos documents ont été traités avec succès.</p>
          </div>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <div>
            <p className="text-red-300 font-semibold">Erreur d'upload</p>
            <p className="text-sm text-red-400/80">Une erreur est survenue. Réessayez.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentUpload;
