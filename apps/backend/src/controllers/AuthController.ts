import type { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import Joi from 'joi';

interface AuthRequest extends Request {
  userId?: string;
}

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response) => {
    try {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details?.[0]?.message || error.message });
      }

      const result = await this.authService.register(value);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details?.[0]?.message || error.message });
      }

      const result = await this.authService.login(value);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  };

  requestPasswordReset = async (req: Request, res: Response) => {
    try {
      const schema = Joi.object({
        email: Joi.string().email().required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details?.[0]?.message || error.message });
      }

      await this.authService.requestPasswordReset(value.email);
      res.json({ message: 'Password reset email sent' });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    try {
      const schema = Joi.object({
        token: Joi.string().required(),
        password: Joi.string().min(8).required()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details?.[0]?.message || error.message });
      }

      await this.authService.resetPassword(value.token, value.password);
      res.json({ message: 'Password reset successful' });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getProfile = async (req: AuthRequest, res: Response) => {
    try {
      const user = await this.authService.getUserById(req.userId!);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  updateProfile = async (req: AuthRequest, res: Response) => {
    try {
      const schema = Joi.object({
        firstName: Joi.string(),
        lastName: Joi.string()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details?.[0]?.message || error.message });
      }

      const user = await this.authService.updateProfile(req.userId!, value);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}