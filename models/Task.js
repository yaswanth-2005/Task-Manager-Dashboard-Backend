import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['UI/UX Design', 'App Design', 'Web Development', 'Mobile Development', 'Graphics Design']
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'overdue'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    required: true
  },
  timeLimit: {
    type: Number, // in hours
    required: true
  },
  assessmentCriteria: [{
    criteria: String,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  files: [{
    filename: String,
    originalName: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  submissions: [{
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submissionDate: {
      type: Date,
      default: Date.now
    },
    files: [String],
    notes: String
  }]
}, {
  timestamps: true
});

export default mongoose.model('Task', taskSchema);