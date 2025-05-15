// client/src/components/DocumentList.jsx
import React from 'react';
import { ListGroup, Button, Spinner } from 'react-bootstrap';
import { FaFilePdf, FaFileWord, FaFileAlt, FaTrash } from 'react-icons/fa';

const DocumentList = ({ documents = [], loading, onDelete }) => {
  // Add default empty array as fallback
  const docs = documents || [];
  
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case '.pdf':
        return <FaFilePdf />;
      case '.docx':
        return <FaFileWord />;
      default:
        return <FaFileAlt />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/documents/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete document');
        }
        
        if (onDelete) {
          onDelete();
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Error deleting document');
      }
    }
  };

  return (
    <div className="document-list">
      <h3>Your Documents</h3>
      
      {loading ? (
        <div className="text-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : docs.length === 0 ? (
        <p className="text-muted">No documents uploaded yet.</p>
      ) : (
        <ListGroup>
          {docs.map((doc) => (
            <ListGroup.Item key={doc.id} className="d-flex justify-content-between align-items-center">
              <div>
                <span className="me-2">{getFileIcon(doc.file_type)}</span>
                <span>{doc.title}</span>
                <small className="text-muted d-block">
                  {formatDate(doc.createdAt)}
                </small>
              </div>
              <Button 
                variant="outline-danger" 
                size="sm" 
                onClick={() => handleDelete(doc.id)}
              >
                <FaTrash />
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default DocumentList;