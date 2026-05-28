import express from 'express';
import { Notice } from '../models.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all active notices (with optional search/filtering)
// @route   GET /api/notices
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { department, category, search } = req.query;
    const now = new Date();

    // Query for active (unexpired) notices
    let query = {
      expiryDate: { $gt: now }
    };

    // Filter by department
    if (department && department !== 'All') {
      // Include targeted department AND notices targeted at 'All'
      query.department = { $in: [department, 'All'] };
    }

    // Filter by category
    if (category) {
      query.category = category.toUpperCase();
    }

    // Filter by search query (case-insensitive keyword matching on title and content)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch and sort notices (newest first, urgent notices prioritized or just sorted by creation date)
    const notices = await Notice.find(query)
      .sort({ category: 1, createdAt: -1 }) // Sort by category first (so URGENT is prioritized if it matches alphabetically, otherwise we can just sort by createdAt)
      .populate('author', 'email');

    // Wait, let's sort URGENT to the top, then by creation date.
    // In our Mongoose model, category is URGENT, GENERAL, EVENT.
    // If we want URGENT notices to appear first, we can do that in JavaScript or structure the query.
    // Let's sort manually in code to ensure URGENT is always at the top, followed by date.
    const sortedNotices = [...notices].sort((a, b) => {
      if (a.category === 'URGENT' && b.category !== 'URGENT') return -1;
      if (a.category !== 'URGENT' && b.category === 'URGENT') return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(sortedNotices);
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ message: 'Failed to retrieve notice listings.' });
  }
});

// @desc    Create a new notice
// @route   POST /api/notices
// @access  Private
router.post('/', protect, async (req, res) => {
  const { title, content, category, department, expiryDays } = req.body;

  try {
    if (!title || !content || !category || !department || !expiryDays) {
      return res.status(400).json({ message: 'All notice fields must be provided.' });
    }

    const days = parseInt(expiryDays);
    if (isNaN(days) || days <= 0) {
      return res.status(400).json({ message: 'Display duration must be a positive integer.' });
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const notice = new Notice({
      title,
      content,
      category: category.toUpperCase(),
      department,
      expiryDate,
      author: req.user._id
    });

    const createdNotice = await notice.save();
    
    // Populate author email for immediate frontend rendering
    const populatedNotice = await Notice.findById(createdNotice._id).populate('author', 'email');

    res.status(201).json(populatedNotice);
  } catch (error) {
    console.error('Error creating notice:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error during notice publication.' });
  }
});

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found.' });
    }

    // Optional: Only allow author to delete, or since it's campus admins, any admin can delete.
    // Let's allow any authenticated admin to delete.
    await Notice.deleteOne({ _id: req.params.id });
    res.json({ message: 'Notice successfully removed.' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).json({ message: 'Server error during notice removal.' });
  }
});

export default router;
