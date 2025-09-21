const mongoose = require('mongoose');

const embeddingSchema = new mongoose.Schema({
  // Content identification
  contentId: {
    type: String,
    required: true,
    index: true,
  },
  
  contentType: {
    type: String,
    enum: ['profile', 'resume', 'project', 'chat_message', 'tech_update', 'psychotest_result', 'skill', 'job_description'],
    required: true,
    index: true,
  },
  
  // Reference to the actual document
  documentRef: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'contentType',
    index: true,
  },
  
  // User association
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  
  // Content metadata
  content: {
    text: {
      type: String,
      required: true,
      maxlength: [10000, 'Content text cannot exceed 10000 characters'],
    },
    title: String,
    summary: String,
    keywords: [String],
    language: {
      type: String,
      default: 'en',
    },
  },
  
  // Vector embedding
  embedding: {
    vector: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v) {
          return v && v.length > 0 && v.length <= 1536; // Common embedding dimensions
        },
        message: 'Embedding vector must be non-empty and not exceed 1536 dimensions',
      },
    },
    model: {
      type: String,
      required: true,
      default: 'text-embedding-ada-002',
    },
    dimensions: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  
  // Chunking information (for large documents)
  chunk: {
    index: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 1,
    },
    startPosition: Number,
    endPosition: Number,
    overlap: Number, // Characters of overlap with adjacent chunks
  },
  
  // Semantic metadata
  semantics: {
    topics: [String],
    entities: [String],
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    categories: [String],
  },
  
  // Search and retrieval metadata
  searchMetadata: {
    boost: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 10,
    },
    tags: [String],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    lastAccessed: Date,
    accessCount: {
      type: Number,
      default: 0,
    },
  },
  
  // Quality metrics
  quality: {
    textLength: Number,
    uniqueWords: Number,
    readabilityScore: Number,
    informationDensity: Number,
  },
  
  // Versioning
  version: {
    type: Number,
    default: 1,
  },
  
  // Status and lifecycle
  status: {
    type: String,
    enum: ['active', 'outdated', 'archived', 'deleted'],
    default: 'active',
    index: true,
  },
  
  // Expiration for temporary embeddings
  expiresAt: Date,
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Compound indexes for efficient querying
embeddingSchema.index({ contentType: 1, user: 1, status: 1 });
embeddingSchema.index({ contentId: 1, contentType: 1 }, { unique: true });
embeddingSchema.index({ user: 1, 'searchMetadata.lastAccessed': -1 });
embeddingSchema.index({ 'semantics.topics': 1 });
embeddingSchema.index({ 'semantics.categories': 1 });
embeddingSchema.index({ createdAt: -1 });

// TTL index for expiring embeddings
embeddingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for embedding age
embeddingSchema.virtual('age').get(function() {
  return Date.now() - this.embedding.createdAt.getTime();
});

// Virtual for chunk identifier
embeddingSchema.virtual('chunkId').get(function() {
  return `${this.contentId}_chunk_${this.chunk.index}`;
});

// Method to calculate cosine similarity with another embedding
embeddingSchema.methods.cosineSimilarity = function(otherEmbedding) {
  if (!otherEmbedding || !otherEmbedding.embedding || !otherEmbedding.embedding.vector) {
    return 0;
  }
  
  const a = this.embedding.vector;
  const b = otherEmbedding.embedding.vector;
  
  if (a.length !== b.length) {
    throw new Error('Embedding dimensions must match for similarity calculation');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
};

// Method to update access tracking
embeddingSchema.methods.trackAccess = function() {
  this.searchMetadata.lastAccessed = new Date();
  this.searchMetadata.accessCount += 1;
  return this.save({ validateBeforeSave: false });
};

// Method to mark as outdated
embeddingSchema.methods.markOutdated = function() {
  this.status = 'outdated';
  return this.save();
};

// Static method to find similar embeddings
embeddingSchema.statics.findSimilar = async function(queryEmbedding, options = {}) {
  const {
    contentTypes = null,
    user = null,
    limit = 10,
    minSimilarity = 0.7,
    excludeIds = [],
    includeContent = false,
  } = options;
  
  // Build match criteria
  const matchCriteria = {
    status: 'active',
    _id: { $nin: excludeIds },
  };
  
  if (contentTypes) {
    matchCriteria.contentType = { $in: Array.isArray(contentTypes) ? contentTypes : [contentTypes] };
  }
  
  if (user) {
    matchCriteria.user = user;
  }
  
  // For now, we'll use a simple approach. In production, you'd use vector search
  // capabilities like MongoDB Atlas Vector Search or a dedicated vector database
  const embeddings = await this.find(matchCriteria).limit(limit * 2); // Get more to filter
  
  const similarities = embeddings.map(embedding => {
    const similarity = queryEmbedding.cosineSimilarity ? 
      queryEmbedding.cosineSimilarity(embedding) :
      this.calculateCosineSimilarity(queryEmbedding.embedding.vector, embedding.embedding.vector);
    
    return {
      embedding,
      similarity,
    };
  });
  
  // Filter by minimum similarity and sort
  const filtered = similarities
    .filter(item => item.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
  
  if (includeContent) {
    // Populate referenced documents
    await this.populate(filtered.map(item => item.embedding), {
      path: 'documentRef',
      select: 'title description content summary',
    });
  }
  
  return filtered;
};

// Static helper method for cosine similarity calculation
embeddingSchema.statics.calculateCosineSimilarity = function(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vector dimensions must match');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
};

// Static method to create embedding from content
embeddingSchema.statics.createFromContent = async function(contentData, embeddingVector, options = {}) {
  const {
    model = 'text-embedding-ada-002',
    chunkInfo = { index: 0, total: 1 },
    semantics = {},
    searchMetadata = {},
  } = options;
  
  const embedding = new this({
    contentId: contentData.contentId,
    contentType: contentData.contentType,
    documentRef: contentData.documentRef,
    user: contentData.user,
    content: {
      text: contentData.text,
      title: contentData.title,
      summary: contentData.summary,
      keywords: contentData.keywords || [],
      language: contentData.language || 'en',
    },
    embedding: {
      vector: embeddingVector,
      model,
      dimensions: embeddingVector.length,
    },
    chunk: chunkInfo,
    semantics,
    searchMetadata: {
      boost: 1.0,
      tags: [],
      priority: 'medium',
      ...searchMetadata,
    },
    quality: {
      textLength: contentData.text.length,
      uniqueWords: new Set(contentData.text.toLowerCase().split(/\s+/)).size,
    },
  });
  
  return embedding.save();
};

// Static method to batch create embeddings
embeddingSchema.statics.batchCreate = async function(embeddingData) {
  return this.insertMany(embeddingData, { ordered: false });
};

// Static method to cleanup old embeddings
embeddingSchema.statics.cleanup = async function(options = {}) {
  const {
    olderThanDays = 90,
    status = 'outdated',
    dryRun = false,
  } = options;
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
  
  const query = {
    status,
    updatedAt: { $lt: cutoffDate },
  };
  
  if (dryRun) {
    return this.countDocuments(query);
  }
  
  return this.deleteMany(query);
};

// Pre-save middleware
embeddingSchema.pre('save', function(next) {
  // Update quality metrics
  if (this.isModified('content.text')) {
    this.quality.textLength = this.content.text.length;
    this.quality.uniqueWords = new Set(this.content.text.toLowerCase().split(/\s+/)).size;
    this.quality.informationDensity = this.quality.uniqueWords / this.quality.textLength;
  }
  
  // Validate embedding dimensions
  if (this.isModified('embedding.vector')) {
    this.embedding.dimensions = this.embedding.vector.length;
  }
  
  next();
});

module.exports = mongoose.model('Embedding', embeddingSchema);
