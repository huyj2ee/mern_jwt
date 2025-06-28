import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import Error from './Error';
import User, { IUser } from '../models/User';
import Env from './Env';

const JwtTokenService = {
  generate: function (username: string): string {
    const expireDuration = process.env.ACCESSTOKEN_VALIDITY + 'ms';
    const signOptions: SignOptions = { expiresIn: expireDuration } as SignOptions ;
    return jwt.sign({ username }, Env.getStr('JWT_SECRET'), signOptions);
  },

  verify: async function (token: string, req: Request, res: Response, next: NextFunction) {
    function processAccessDenied(req: Request, res: Response, next: NextFunction, roles: Array<string> | null, defaultMsg: string) {
      let idx = req.path.indexOf('/', 1);
      idx = idx >=0 ? idx : req.path.length;
      const path = req.path.substring(0, idx);
      let suffixIdx = req.path.lastIndexOf('/');
      let suffixPath = req.path.substring(suffixIdx, req.path.length);
      switch(path) {
        case '/users':
          if (req.method === 'POST') {
            if (roles === null || !roles.includes('admin')) {
              Error.printError(req, res, Error.status.SC_FORBIDDEN, 'Admin role is required to create new user.');
              return;
            }
          }
          else if (req.method === 'GET') {
            if (suffixPath === '/roles') {
              if (req.params.username) {
                if (roles === null || !roles.includes('admin')) {
                  Error.printError(req, res, Error.status.SC_FORBIDDEN, 'Admin role is required to get assigned roles list.');
                  return;
                }
              }
            }
            else {
              if (req.params.username) {
                if (roles === null || !roles.includes('admin')) {
                  Error.printError(req, res, Error.status.SC_FORBIDDEN, 'Admin role is required to get user.');
                  return;
                }
              }
              else {
                if (roles === null || !roles.includes('admin')) {
                  Error.printError(req, res, Error.status.SC_FORBIDDEN, 'Admin role is required to get user list.');
                  return
                }
              }
            }
          }
          else if (req.method === 'DELETE') {
            if (req.params.role && suffixPath.substring(1, suffixPath.length) === req.params.role) {
              if (roles === null || !roles.includes('admin')) {
                Error.printError(req, res, Error.status.SC_FORBIDDEN, 'Admin role is required to revoke role.');
                return;
              }
            }
            else {
              if (req.params.username) {
                if (roles === null || !roles.includes('admin')) {
                  Error.printError(req, res, Error.status.SC_FORBIDDEN, 'Admin role is required to delete user.');
                  return;
                }
              }
            }
          }
          else if (req.method === 'PUT') {
            if (req.params.role && suffixPath.substring(1, suffixPath.length) === req.params.role) {
              if (roles === null || !roles.includes('admin')) {
                Error.printError(req, res, Error.status.SC_FORBIDDEN, 'Admin role is required to assign role.');
                return;
              }
            }
            else {
              if (req.params.username) {
                if (roles === null || !roles.includes('admin')) {
                  Error.printError(req, res, Error.status.SC_FORBIDDEN, 'Admin role is required to edit user.');
                  return;
                }
              }
            }
          }
          break;

        case '/signout':
          if (roles === null) {
            Error.printError(req, res, Error.status.SC_UNAUTHORIZED, 'You must sign in to execute sign out operation.');
            return;
          }
          break;

        case '/password':
          if (roles === null) {
            Error.printError(req, res, Error.status.SC_UNAUTHORIZED, 'You must sign in to execute change password operation.');
            return;
          }
          break;

        case '/roles':
          if (roles === null || !roles.includes('admin')) {
            Error.printError(req, res, Error.status.SC_FORBIDDEN, 'Admin role is required to get all roles list.');
            return;
          }
          break;

        case '/protected':
          if (roles === null) {
            Error.printError(req, res, Error.status.SC_FORBIDDEN, 'abc');
            return;
          }
          if (!roles.includes('admin')) {
            Error.printError(req, res, Error.status.SC_FORBIDDEN, 'abc');
            return;
          }
          break;

        default:
          Error.printError(req, res, Error.status.SC_FORBIDDEN, defaultMsg);
          return;
      }
      next();
    }
    if (!token) {
      processAccessDenied(req, res, next, null, 'No access token found.');
      return;
    }
    try {
      const decoded: any = jwt.verify(token, Env.getStr('JWT_SECRET'));
      const username = decoded.username;
      const user: IUser|null = await User.findOne({ username });
      if (user) {
        let isExpired = decoded.exp * 1000 < (new Date()).getTime();
        if (user.lastSignout && user.lastSignout.getTime() > decoded.iat * 1000) {
          isExpired = true;
        }
        if (isExpired) {
          processAccessDenied(req, res, next, null, 'Access token is expired.');
          return;
        }
        req.params.signedInuser = user as any;
        if (!user.accountNonLocked) {
          Error.printError(req, res, Error.status.SC_UNAUTHORIZED, 'Too many invalid attempts. Account is locked!!');
          return;
        }
        if (!user.enabled) {
          Error.printError(req, res, Error.status.SC_UNAUTHORIZED, 'Account is disabled.');
          return;
        }
        processAccessDenied(req, res, next, user.roles, 'Route has no error handler.');
        return;
      }
      else {
        Error.printError(req, res, Error.status.SC_UNAUTHORIZED, 'User is not found');
        return;
      }
    } catch (err) {
      processAccessDenied(req, res, next, null, 'Access token is not valid.');
      return;
    }
  }
};

export default JwtTokenService;