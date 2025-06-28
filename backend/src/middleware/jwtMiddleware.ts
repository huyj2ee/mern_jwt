import { Request, Response, NextFunction } from 'express';
import JwtTokenService from '../utils/JwtTokenService';

const jwtMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const tokenObj: string | undefined = req.header('Authorization')?.split(' ')[1];
  const token: string = tokenObj === undefined ? '' : tokenObj as string;
  await JwtTokenService.verify(token, req, res, next);
};

export default jwtMiddleware;
