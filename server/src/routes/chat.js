const express = require('express');
const router = express.Router();
const vectorStore = require('../services/vectorStore');
const llmService = require('../services/llmService');
const { ChatHistory } = require('../models');

// Process a chat query
router.post('/query', async (req, res) => {
  try {
    const { query, userId = 1 } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    // Retrieve relevant document chunks
    const similarChunks = await vectorStore.similaritySearch(query);

    if (similarChunks.length === 0) {
      return res.status(200).json({
        answer: "I don't have enough information to answer that question. Please upload relevant documents first."
      });
    }

    // Generate response using LLM
    const answer = await llmService.generateResponse(query, similarChunks);

    // Save to chat history
    await ChatHistory.create({
      UserId: userId,
      question: query,
      answer
    });

    // Return response with sources
    const sources = similarChunks
      .filter(item => item.chunk && item.chunk.Document) // Filter out any null chunks or documents
      .map(item => ({
        documentId: item.chunk.Document.id,
        documentTitle: item.chunk.Document.title,
        chunkId: item.chunk.id,
        similarity: item.similarity,
        snippet: item.chunk.content.substring(0, 150) + '...'
      }));


    res.status(200).json({ answer, sources });
  } catch (error) {
    console.error('Error processing chat query:', error);
    res.status(500).json({ message: 'Error processing query', error: error.message });
  }
});

// Get chat history
router.get('/history', async (req, res) => {
  try {
    const userId = req.query.userId || 1;

    const history = await ChatHistory.findAll({
      where: { UserId: userId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.status(200).json({ history });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Error fetching chat history', error: error.message });
  }
});

module.exports = router;