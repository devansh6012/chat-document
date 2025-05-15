import React, { useState } from 'react';
import { Form, Button, Alert, ProgressBar } from 'react-bootstrap';

const DocumentUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    if (selectedFile && !title) {
      // Set default title from filename
      setTitle(selectedFile.name.split('.')[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    try {
      setUploading(true);
      setProgress(0);
      setError('');
      setSuccess('');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || file.name);
      
      // Simulating upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 5;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 300);
      
      const response = await fetch('http://localhost:3001/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      
      setProgress(100);
      const data = await response.json();
      setSuccess(`Document "${data.document.title}" uploaded successfully!`);
      
      // Reset form
      setFile(null);
      setTitle('');
      
      // Refresh document list
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      setError(error.message || 'Error uploading document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="document-upload">
      <h3>Upload Document</h3>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="documentTitle" className="mb-3">
          <Form.Label>Document Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Form.Group>
        
        <Form.Group controlId="documentFile" className="mb-3">
          <Form.Label>Select File</Form.Label>
          <Form.Control
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <Form.Text className="text-muted">
            Supported formats: PDF, DOCX, TXT (max 10MB)
          </Form.Text>
        </Form.Group>
        
        {uploading && (
          <ProgressBar 
            now={progress} 
            label={`${progress}%`} 
            className="mb-3" 
          />
        )}
        
        <Button 
          variant="primary" 
          type="submit" 
          disabled={uploading || !file}
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </Form>
    </div>
  );
};

export default DocumentUpload;