const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const documentProcessor = require('../services/documentProcessor');
const { Document } = require('../models');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  }
});

// Upload a document
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.body.userId || 1; // Default to user 1 if not provided
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const document = await documentProcessor.processDocument(req.file, userId, title);
    
    res.status(201).json({
      message: 'Document uploaded and processed successfully',
      document: {
        id: document.id,
        title: document.title,
        file_type: document.file_type
      }
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'Error processing document', error: error.message });
  }
});

// Get all documents for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || 1; // Default to user 1 if not provided
    
    const documents = await Document.findAll({
      where: { UserId: userId },
      attributes: ['id', 'title', 'file_type', 'createdAt']
    });
    
    res.status(200).json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
});

// Delete a document
router.delete('/:id', async (req, res) => {
  try {
    const documentId = req.params.id;
    
    const document = await Document.findByPk(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Delete the file
    if (document.file_path) {
      try {
        await fs.promises.unlink(document.file_path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
    
    // Delete from database (cascades to chunks and embeddings)
    await document.destroy();
    
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Error deleting document', error: error.message });
  }
});

module.exports = router;