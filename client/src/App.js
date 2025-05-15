// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tab, Tabs } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import DocumentUpload from './components/DocumentUpload';
import DocumentList from './components/DocumentList';
import ChatInterface from './components/ChatInterface';

function App() {
  // Initialize as empty array, not undefined
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [error, setError] = useState('');

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Your backend might not be ready yet, so let's handle possible errors
      try {
        const response = await fetch('http://localhost:3001/api/documents');
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        const data = await response.json();
        setDocuments(data.documents || []);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Could not connect to server. Ensure your backend is running.');
        // Initialize with empty array if fetch fails
        setDocuments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <Container fluid className="app-container">
      <Row className="header">
        <Col>
          <h1>Document Q&A Chatbot</h1>
        </Col>
      </Row>
      
      {error && (
        <Row>
          <Col>
            <div className="alert alert-warning">{error}</div>
          </Col>
        </Row>
      )}
      
      <Row className="main-content">
        <Col md={3} className="sidebar">
          <DocumentUpload onUploadSuccess={fetchDocuments} />
          <hr />
          <DocumentList 
            documents={documents} 
            loading={loading}
            onDelete={fetchDocuments}
          />
        </Col>
        
        <Col md={9} className="content-area">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="chat" title="Chat">
              <ChatInterface />
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
}

export default App;