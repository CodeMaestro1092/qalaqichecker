import express, { Request, Response } from 'express';
import { apiClient } from '../utils/apiClient';
import { checkExamAvailability } from '../utils/checkAvailability';
import { db } from '../utils/database';
import { User } from '../types';
import { triggerManualCheck } from '../utils/scheduler';

const router = express.Router();

// Get available categories for a personal number
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const { personalNumber } = req.query;

    if (!personalNumber || typeof personalNumber !== 'string') {
      return res.status(400).json({ error: 'Personal number is required' });
    }

    const categories = await apiClient.getCategories(personalNumber);
    res.json(categories);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      error: 'Failed to fetch categories',
      message: error.message,
    });
  }
});

// Get available centers for a category
router.get('/centers', async (req: Request, res: Response) => {
  try {
    const { categoryCode } = req.query;

    if (!categoryCode) {
      return res.status(400).json({ error: 'Category code is required' });
    }

    const centers = await apiClient.getCenters(Number(categoryCode));
    res.json(centers);
  } catch (error: any) {
    console.error('Error fetching centers:', error);
    res.status(500).json({
      error: 'Failed to fetch centers',
      message: error.message,
    });
  }
});

// Check exam availability
router.post('/check', async (req: Request, res: Response) => {
  try {
    const { personalNumber, categoryCode, centerId } = req.body;

    if (!personalNumber || !categoryCode || !centerId) {
      return res.status(400).json({
        error: 'Personal number, category code, and center ID are required',
      });
    }

    const result = await checkExamAvailability(
      personalNumber,
      Number(categoryCode),
      Number(centerId)
    );

    res.json(result);
  } catch (error: any) {
    console.error('Error checking exam:', error);
    res.status(500).json({
      error: 'Failed to check exam availability',
      message: error.message,
    });
  }
});

// Subscribe to monitoring
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const {
      personalNumber,
      phoneNumber,
      categoryCode,
      categoryName,
      centerId,
      centerName,
      email,
      telegramChatId,
    } = req.body;

    if (!personalNumber || !phoneNumber || !categoryCode || !centerId) {
      return res.status(400).json({
        error: 'Missing required fields',
      });
    }

    if (!email && !telegramChatId) {
      return res.status(400).json({
        error: 'At least one notification method (email or telegram) is required',
      });
    }

    const user: User = {
      id: `${personalNumber}-${categoryCode}-${Date.now()}`,
      personalNumber,
      phoneNumber,
      categoryCode: Number(categoryCode),
      categoryName,
      centerId: Number(centerId),
      centerName,
      email,
      telegramChatId,
      notified: false,
      lastChecked: new Date().toISOString(),
    };

    await db.addUser(user);

    res.json({
      success: true,
      message: 'თქვენ წარმატებით გამოიწერეთ შეტყობინებები',
      user,
    });
  } catch (error: any) {
    console.error('Error subscribing user:', error);
    res.status(500).json({
      error: 'Failed to subscribe',
      message: error.message,
    });
  }
});

// Get all subscribed users (for admin)
router.get('/subscribers', async (req: Request, res: Response) => {
  try {
    const users = await db.getUsers();
    res.json(users);
  } catch (error: any) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({
      error: 'Failed to fetch subscribers',
      message: error.message,
    });
  }
});

// Unsubscribe
router.delete('/unsubscribe/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.removeUser(id);
    res.json({ success: true, message: 'Successfully unsubscribed' });
  } catch (error: any) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({
      error: 'Failed to unsubscribe',
      message: error.message,
    });
  }
});

// Manual check trigger (for testing)
router.post('/manual-check', async (req: Request, res: Response) => {
  try {
    const result = await triggerManualCheck();
    res.json(result);
  } catch (error: any) {
    console.error('Error triggering manual check:', error);
    res.status(500).json({
      error: 'Failed to trigger check',
      message: error.message,
    });
  }
});

export default router;
