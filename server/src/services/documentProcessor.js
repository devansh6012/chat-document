const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { Document, Chunk } = require('../models');
const embeddingService = require('./embeddingService');

const CHUNK_SIZE = 1000; // characters per chunk
const CHUNK_OVERLAP = 200;

class DocumentProcessor {
  async processDocument(file, userId, title) {
    try {
      const filePath = file.path;
      const fileType = path.extname(file.originalname).toLowerCase();
      
      // Save document metadata to database
      const document = await Document.create({
        title: title || file.originalname,
        file_path: filePath,
        file_type: fileType,
        UserId: userId
      });

      // Extract text based on file type
      let text = '';
      if (fileType === '.pdf') {
        const dataBuffer = await fs.readFile(filePath);
        const pdfData = await pdfParse(dataBuffer);
        text = pdfData.text;
      } else if (fileType === '.docx') {
        const dataBuffer = await fs.readFile(filePath);
        const result = await mammoth.extractRawText({ buffer: dataBuffer });
        text = result.value;
      } else if (fileType === '.txt') {
        text = await fs.readFile(filePath, 'utf8');
      } else {
        throw new Error('Unsupported file type');
      }

      // Chunk the text
      const chunks = this.chunkText(text);
      
      // Save chunks to database
      for (let i = 0; i < chunks.length; i++) {
        const chunk = await Chunk.create({
          DocumentId: document.id,
          content: chunks[i],
          chunk_index: i
        });
        
        // Generate and store embedding
        await embeddingService.generateAndStoreEmbedding(chunk.id, chunks[i]);
      }

      return document;
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  }

  chunkText(text) {
    const chunks = [];
    
    // Simple chunking strategy
    for (let i = 0; i < text.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
      if (i > 0) i -= CHUNK_OVERLAP;
      chunks.push(text.slice(i, i + CHUNK_SIZE));
    }
    
    return chunks;
  }
}

module.exports = new DocumentProcessor();