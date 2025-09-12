import type { Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService';
import Joi from 'joi';

interface AuthRequest extends Request {
  userId: string; // set by auth middleware for all protected routes
}

export class CategoryController {
  private categoryService = new CategoryService();

  // All category routes are behind auth middleware, so userId is guaranteed
  private getUserId(req: AuthRequest): string { return req.userId; }

  // Fetch all categories (default + user-specific)
  getAll = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const categories = await this.categoryService.getAll(this.getUserId(req));
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  };

  // Fetch a single category by id (if user has access)
  getById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const category = await this.categoryService.getById(id, this.getUserId(req));
      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }
      res.json(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  };

  // Create a new user-specific category
  create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = this.getUserId(req);

      const schema = Joi.object({
        name: Joi.string().trim().min(1).max(100).required(),
        type: Joi.string().valid('income', 'expense').required(),
        color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).required(),
        icon: Joi.string().trim().min(1).max(50).required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0]?.message || 'Validation failed' });
        return;
      }

      const existingCategory = await this.categoryService.findByName(value.name, userId, value.type);
      if (existingCategory) {
        res.status(409).json({ error: 'Category with this name already exists for this type' });
        return;
      }

      const category = await this.categoryService.create(userId, value);
      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  };

  // Update a user-specific category
  update = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = this.getUserId(req);

      const { id } = req.params as { id: string };

      const schema = Joi.object({
        name: Joi.string().trim().min(1).max(100),
        color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/),
        icon: Joi.string().trim().min(1).max(50)
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0]?.message || 'Validation failed' });
        return;
      }

    const existingCategory = await this.categoryService.getById(id, userId);
      if (!existingCategory) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      if (existingCategory.isDefault) {
        res.status(403).json({ error: 'Cannot update default categories' });
        return;
      }

      if (value.name && value.name !== existingCategory.name) {
        const nameExists = await this.categoryService.findByName(value.name, userId, existingCategory.type);
        if (nameExists) {
          res.status(409).json({ error: 'Category with this name already exists for this type' });
          return;
        }
      }

    const updatedCategory = await this.categoryService.update(id, userId, value);
      if (!updatedCategory) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      res.json(updatedCategory);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ error: 'Failed to update category' });
    }
  };

  // Delete a user-specific category (if unused)
  delete = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = this.getUserId(req);

      const { id } = req.params as { id: string };
    const existingCategory = await this.categoryService.getById(id, userId);
      if (!existingCategory) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      if (existingCategory.isDefault) {
        res.status(403).json({ error: 'Cannot delete default categories' });
        return;
      }

      const hasTransactions = await this.categoryService.hasTransactions(id);
      if (hasTransactions) {
        res.status(409).json({ error: 'Cannot delete category that has transactions. Please reassign or delete transactions first.' });
        return;
      }

    const deleted = await this.categoryService.delete(id, userId);
      if (!deleted) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ error: 'Failed to delete category' });
    }
  };

  // Fetch categories filtered by type
  getByType = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { type } = req.params as { type: string };
      if (!['income', 'expense'].includes(type)) {
        res.status(400).json({ error: 'Invalid category type. Must be "income" or "expense"' });
        return;
      }
  const categories = await this.categoryService.getByType(type as 'income' | 'expense', this.getUserId(req));
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories by type:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  };

  // Usage statistics (requires auth)
  getUsageStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const stats = await this.categoryService.getUsageStats(this.getUserId(req));
      res.json(stats);
    } catch (error) {
      console.error('Error fetching category usage stats:', error);
      res.status(500).json({ error: 'Failed to fetch category statistics' });
    }
  };
}