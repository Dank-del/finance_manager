import type { Request, Response } from 'express';
import { TransactionService } from '../services/TransactionService';
import Joi from 'joi';

interface AuthRequest extends Request {
  userId?: string;
}

export class TransactionController {
  private transactionService = new TransactionService();

  create = async (req: AuthRequest, res: Response) => {
    try {
      const schema = Joi.object({
        amount: Joi.number().positive().required(),
        type: Joi.string().valid('income', 'expense').required(),
        categoryId: Joi.string().uuid().required(),
        description: Joi.string().required(),
        date: Joi.date().required(),
        isRecurring: Joi.boolean().default(false),
        recurringPeriod: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly'),
        recurringEndDate: Joi.date()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details?.[0]?.message || error.message });
      }

      const transaction = await this.transactionService.create(req.userId!, value);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getAll = async (req: AuthRequest, res: Response) => {
    try {
      const { page = 1, limit = 20, type, categoryId, startDate, endDate } = req.query;
      
      const transactions = await this.transactionService.getAll(req.userId!, {
        page: Number(page),
        limit: Number(limit),
        type: type as string,
        categoryId: categoryId as string,
        startDate: startDate as string,
        endDate: endDate as string
      });
      
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getById = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.params.id) {
        return res.status(400).json({ error: 'Transaction ID is required' });
      }
      const transaction = await this.transactionService.getById(req.userId!, req.params.id);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  update = async (req: AuthRequest, res: Response) => {
    try {
      const schema = Joi.object({
        amount: Joi.number().positive(),
        type: Joi.string().valid('income', 'expense'),
        categoryId: Joi.string().uuid(),
        description: Joi.string(),
        date: Joi.date(),
        isRecurring: Joi.boolean(),
        recurringPeriod: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly'),
        recurringEndDate: Joi.date()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details?.[0]?.message || error.message });
      }

      if (!req.params.id) {
        return res.status(400).json({ error: 'Transaction ID is required' });
      }

      const transaction = await this.transactionService.update(req.userId!, req.params.id, value);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  delete = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.params.id) {
        return res.status(400).json({ error: 'Transaction ID is required' });
      }
      const deleted = await this.transactionService.delete(req.userId!, req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getStats = async (req: AuthRequest, res: Response) => {
    try {
      const stats = await this.transactionService.getStats(req.userId!);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}