import type { Request, Response } from 'express';
import { GoalService } from '../services/GoalService';
import Joi from 'joi';

interface AuthRequest extends Request {
  userId?: string;
}

export class GoalController {
  private goalService = new GoalService();

  create = async (req: AuthRequest, res: Response) => {
    try {
      const schema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().allow('').default(''),
        targetAmount: Joi.number().positive().required(),
        targetDate: Joi.date().required(),
        priority: Joi.string().valid('low', 'medium', 'high').default('medium')
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details?.[0]?.message || error.message });
      }

      const goal = await this.goalService.create(req.userId!, value);
      res.status(201).json(goal);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getAll = async (req: AuthRequest, res: Response) => {
    try {
      const goals = await this.goalService.getAll(req.userId!);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getById = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.params.id) {
        return res.status(400).json({ error: 'Goal ID is required' });
      }
      const goal = await this.goalService.getById(req.userId!, req.params.id);
      if (!goal) {
        return res.status(404).json({ error: 'Goal not found' });
      }
      res.json(goal);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  update = async (req: AuthRequest, res: Response) => {
    try {
      const schema = Joi.object({
        title: Joi.string(),
        description: Joi.string().allow(''),
        targetAmount: Joi.number().positive(),
        currentAmount: Joi.number().min(0),
        targetDate: Joi.date(),
        priority: Joi.string().valid('low', 'medium', 'high'),
        isCompleted: Joi.boolean()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details?.[0]?.message || error.message });
      }

      if (!req.params.id) {
        return res.status(400).json({ error: 'Goal ID is required' });
      }

      const goal = await this.goalService.update(req.userId!, req.params.id, value);
      if (!goal) {
        return res.status(404).json({ error: 'Goal not found' });
      }
      res.json(goal);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  delete = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.params.id) {
        return res.status(400).json({ error: 'Goal ID is required' });
      }
      const deleted = await this.goalService.delete(req.userId!, req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Goal not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  addProgress = async (req: AuthRequest, res: Response) => {
    try {
      const schema = Joi.object({
        amount: Joi.number().positive().required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details?.[0]?.message || error.message });
      }

      if (!req.params.id) {
        return res.status(400).json({ error: 'Goal ID is required' });
      }

      const goal = await this.goalService.addProgress(req.userId!, req.params.id, value.amount);
      if (!goal) {
        return res.status(404).json({ error: 'Goal not found' });
      }
      res.json(goal);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };
}