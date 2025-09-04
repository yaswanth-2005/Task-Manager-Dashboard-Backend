import express from 'express';
import Task from '../models/Task.js';
import { authMiddleware } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Get all tasks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get task by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('submissions.submittedBy', 'name email');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new task
router.post('/', authMiddleware, async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      createdBy: req.user._id
    };

    const task = new Task(taskData);
    await task.save();
    
    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email');
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update task progress
router.patch('/:id/progress', authMiddleware, async (req, res) => {
  try {
    const { progress } = req.body;
    
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { progress },
      { new: true }
    ).populate('assignedTo', 'name email avatar');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit task
router.post('/:id/submit', authMiddleware, upload.array('files'), async (req, res) => {
  try {
    const { notes } = req.body;
    const files = req.files?.map(file => file.filename) || [];
    
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          submissions: {
            submittedBy: req.user._id,
            files,
            notes
          }
        }
      },
      { new: true }
    ).populate('submissions.submittedBy', 'name email');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update assessment criteria
router.patch('/:id/assessment', authMiddleware, async (req, res) => {
  try {
    const { criteriaIndex, completed } = req.body;
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    if (task.assessmentCriteria[criteriaIndex]) {
      task.assessmentCriteria[criteriaIndex].completed = completed;
      await task.save();
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;