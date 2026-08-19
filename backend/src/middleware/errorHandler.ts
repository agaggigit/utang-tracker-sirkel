import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled Error:', err);
    
    // Default error
    res.status(500).json({
        message: "Internal server error"
    });
};
