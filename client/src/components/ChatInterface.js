import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Card, Spinner } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import { FaPaperPlane, FaUser, FaRobot } from 'react-icons/fa';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = {
      sender: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/chat/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      const botMessage = {
        sender: 'bot',
        content: data.answer,
        timestamp: new Date(),
        sources: data.sources || []
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      
      const errorMessage = {
        sender: 'bot',
        content: 'Sorry, I encountered an error while processing your request.',
        timestamp: new Date(),
        error: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <h3>Ask questions about your documents</h3>
            <p>Upload documents and then ask questions to get answers based on their content.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <Card 
              key={index} 
              className={`message ${msg.sender} ${msg.error ? 'error' : ''}`}
            >
              <Card.Body>
                <div className="message-header">
                  <span className="sender-icon">
                    {msg.sender === 'user' ? <FaUser /> : <FaRobot />}
                  </span>
                  <small className="timestamp">
                    {msg.timestamp.toLocaleTimeString()}
                  </small>
                </div>
                <div className="message-content">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="message-sources">
                    <small className="sources-title">Sources:</small>
                    <ul className="sources-list">
                      {msg.sources.map((source, idx) => (
                        <li key={idx}>
                          <strong>{source.documentTitle}</strong>
                          <span className="source-snippet">{source.snippet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card.Body>
            </Card>
          ))
        )}
        {loading && (
          <div className="loading-message">
            <Spinner animation="border" size="sm" />
            <span>Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <Form className="chat-input" onSubmit={handleSubmit}>
        <Form.Group className="input-group">
          <Form.Control
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your documents..."
            disabled={loading}
          />
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading || !input.trim()}
          >
            <FaPaperPlane />
          </Button>
        </Form.Group>
      </Form>
    </div>
  );
};

export default ChatInterface;