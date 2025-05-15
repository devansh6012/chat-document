const { pipeline } = require('@xenova/transformers');
const { Embedding } = require('../models');

class EmbeddingService {
  constructor() {
    this.pipe = null;
    this.initModel();
  }

  async initModel() {
    try {
      this.pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log('Embedding model loaded successfully');
    } catch (error) {
      console.error('Error initializing embedding model:', error);
    }
  }

  async generateEmbedding(text) {
    if (!this.pipe) await this.initModel();
    
    try {
      // Generate embeddings
      const output = await this.pipe(text, {
        pooling: 'mean',
        normalize: true
      });
      
      // Convert to array
      const embedding = Array.from(output.data);
      return embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  async generateAndStoreEmbedding(chunkId, text) {
    try {
      const embedding = await this.generateEmbedding(text);
      
      await Embedding.create({
        ChunkId: chunkId,
        embedding: JSON.stringify(embedding)
      });
      
      return embedding;
    } catch (error) {
      console.error('Error storing embedding:', error);
      throw error;
    }
  }
}

module.exports = new EmbeddingService();