const { Embedding, Chunk, Document, sequelize } = require('../models');
const embeddingService = require('./embeddingService');
const { Sequelize, Op } = require('sequelize');

class VectorStore {
  async similaritySearch(query, topK = 5) {
  try {
    // Generate embedding for the query
    const queryEmbedding = await embeddingService.generateEmbedding(query);
    
    // Get all embeddings from the database with explicit eager loading
    const embeddings = await Embedding.findAll({
      include: [{
        model: Chunk,
        required: true, // Only get embeddings with valid chunks
        include: [{
          model: Document,
          required: true // Only get chunks with valid documents
        }]
      }]
    });
    
    // Calculate cosine similarity (only for valid records)
    const results = embeddings
      .filter(embedding => embedding.Chunk && embedding.Chunk.Document)
      .map(embedding => {
        const embeddingVector = JSON.parse(embedding.embedding);
        const similarity = this.cosineSimilarity(queryEmbedding, embeddingVector);
        
        return {
          chunk: embedding.Chunk,
          similarity
        };
      });
    
    // Sort by similarity and take top K
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, topK);
  } catch (error) {
    console.error('Error in similarity search:', error);
    throw error;
  }
}

  
  cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

module.exports = new VectorStore();