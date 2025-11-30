import { Request, Response } from 'express';

export const getExample = (req: Request, res: Response) => {
  res.status(200).json({ message: 'Example route working' });
};
