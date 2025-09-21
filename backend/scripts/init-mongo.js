// MongoDB initialization script for Docker
db = db.getSiblingDB('careercompass');

// Create collections
db.createCollection('users');
db.createCollection('profiles');
db.createCollection('chats');
db.createCollection('psychotestresults');
db.createCollection('resumes');
db.createCollection('projects');
db.createCollection('techupdates');
db.createCollection('embeddings');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": -1 });

db.profiles.createIndex({ "user": 1 }, { unique: true });
db.profiles.createIndex({ "skills.name": 1 });
db.profiles.createIndex({ "completionScore": -1 });

db.chats.createIndex({ "user": 1, "createdAt": -1 });
db.chats.createIndex({ "user": 1, "status": 1 });

db.psychotestresults.createIndex({ "user": 1, "createdAt": -1 });
db.psychotestresults.createIndex({ "completedAt": -1 });

db.resumes.createIndex({ "user": 1, "isActive": 1 });
db.resumes.createIndex({ "shareableLink": 1 });

db.projects.createIndex({ "user": 1, "status": 1 });
db.projects.createIndex({ "visibility": 1 });

db.techupdates.createIndex({ "category": 1, "publishedAt": -1 });
db.techupdates.createIndex({ "status": 1, "publishedAt": -1 });
db.techupdates.createIndex({ "tags": 1 });

// Text search indexes
db.techupdates.createIndex({
  "title": "text",
  "content": "text",
  "summary": "text",
  "tags": "text"
});

db.projects.createIndex({
  "title": "text",
  "description": "text",
  "technologies": "text",
  "tags": "text"
});

print('MongoDB initialization completed successfully!');
