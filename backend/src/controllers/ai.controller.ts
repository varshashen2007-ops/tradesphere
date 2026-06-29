import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/ai.service';

export class AIController {
  static async chat(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Message is required',
        });
      }

      const reply = await AIService.chat(message);

      res.json({
        success: true,
        message: 'AI response generated',
        data: {
          reply,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}