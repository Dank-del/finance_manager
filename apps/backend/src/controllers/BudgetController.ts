import type { Request, Response } from 'express';
import { BudgetService } from '../services/BudgetService';
import Joi from 'joi';

interface AuthRequest extends Request {
  userId?: string;
}

export class BudgetController {
  private budgetService = new BudgetService();

  create = async (req: AuthRequest, res: Response) => {
    try {
      const schema = Joi.object({
        categoryId: Joi.string().uuid().required(),
        amount: Joi.number().positive().required(),
        period: Joi.string().valid('weekly', 'monthly', 'yearly').required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().required(),
        alertThreshold: Joi.number().min(0).max(100).default(80)
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details?.[0]?.message || error.message });
      }

      const budget = await this.budgetService.create(req.userId!, value);
      res.status(201).json(budget);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getAll = async (req: AuthRequest, res: Response) => {
    try {
      const budgets = await this.budgetService.getAll(req.userId!);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getById = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.params.id) {
        return res.status(400).json({ error: 'Budget ID is required' });
      }
      const budget = await this.budgetService.getById(req.userId!, req.params.id);
      if (!budget) {
        return res.status(404).json({ error: 'Budget not found' });
      }
      res.json(budget);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  update = async (req: AuthRequest, res: Response) => {
    try {
      const schema = Joi.object({
        amount: Joi.number().positive(),
        period: Joi.string().valid('weekly', 'monthly', 'yearly'),
        startDate: Joi.date(),
        endDate: Joi.date(),
        alertThreshold: Joi.number().min(0).max(100),
        isActive: Joi.boolean()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details?.[0]?.message || error.message });
      }

      if (!req.params.id) {
        return res.status(400).json({ error: 'Budget ID is required' });
      }

      const budget = await this.budgetService.update(req.userId!, req.params.id, value);
      if (!budget) {
        return res.status(404).json({ error: 'Budget not found' });
      }
      res.json(budget);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  delete = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.params.id) {
        return res.status(400).json({ error: 'Budget ID is required' });
      }
      const deleted = await this.budgetService.delete(req.userId!, req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Budget not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}