import type { Request, Response } from 'express';
import { UserPreferenceService } from '../services/UserPreferenceService';
import Joi from 'joi';

interface AuthRequest extends Request {
  userId?: string;
}

export class UserPreferenceController {
  private userPreferenceService = new UserPreferenceService();

  getPreferences = async (req: AuthRequest, res: Response) => {
    try {
      const preferences = await this.userPreferenceService.getByUserId(req.userId!);
      
      if (!preferences) {
        const defaultPrefs = await this.userPreferenceService.create(req.userId!, {
          currency: 'USD',
          theme: 'light'
        });
        return res.json(defaultPrefs);
      }
      
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  updatePreferences = async (req: AuthRequest, res: Response) => {
    try {
      const schema = Joi.object({
        currency: Joi.string().valid('USD', 'EUR', 'GBP', 'INR'),
        theme: Joi.string().valid('light', 'dark', 'system')
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details?.[0]?.message || error.message });
      }

      const preferences = await this.userPreferenceService.upsert(req.userId!, value);
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}