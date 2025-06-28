import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User';
import Error from '../utils/Error';
import RefreshTokenService from '../utils/RefreshTokenService';
import JwtTokenService from '../utils/JwtTokenService';
import RefreshToken, { IRefreshToken } from '../models/RefreshToken';
import Env from '../utils/Env';

class JwtController {
  async signIn(req: Request, res: Response) {
    const ATTEMPTS_LIMIT = Env.getInt('ATTEMPTS_LIMIT');
    const REFRESHTOKEN_VALIDITY = Env.getInt('REFRESHTOKEN_VALIDITY');
    const path = req.originalUrl.substring(0, req.originalUrl.lastIndexOf('/')) + '/refreshtoken';
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      Error.printError(req, res, Error.status.SC_UNAUTHORIZED, 'User not found.');
      return;
    }
    if (!user.accountNonLocked) {
      Error.printError(req, res, Error.status.SC_UNAUTHORIZED, 'Too many invalid attempts. Account is locked!!');
      return;
    }
    if (!user.enabled) {
      Error.printError(req, res, Error.status.SC_UNAUTHORIZED, 'Account is disabled.');
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      if (user.attempts) {
        user.attempts = 0;
        await user.save();
      }
      const refreshToken: IRefreshToken = await RefreshTokenService.create(user.username);
      const accessToken = JwtTokenService.generate(user.username);
      res.cookie(
        'refreshToken',
        refreshToken.token,
        {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: REFRESHTOKEN_VALIDITY * 1000,
          path
        }
      );
      res.status(Error.status.SC_OK).json({
        username: user.username,
        accessToken,
        roles: user.roles
      });
      return;
    }
    // processFailedAttempts
    if (user.attempts) {
      user.attempts = user.attempts + 1;
      await user.save();
      if (user.attempts + 1 > ATTEMPTS_LIMIT) {
        user.accountNonLocked = false;
        await user.save();
        Error.printError(req, res, Error.status.SC_UNAUTHORIZED, 'Too many invalid attempts. Account is locked!!');
        return;
      }
    }
    else {
      user.attempts = 1;
      await user.save();
    }
    Error.printError(req, res, Error.status.SC_UNAUTHORIZED, 'Invalid password.');
  }

  async signOut(req: Request, res: Response) {
    const user: IUser = req.params.signedInuser as any;
    user.lastSignout = new Date();
    await user.save();
    res.status(Error.status.SC_NO_CONTENT).send();
  }

  async refreshToken(req: Request, res: Response) {
    const token = req.cookies.refreshToken;
    if (!token) {
      Error.printError(req, res, Error.status.SC_FORBIDDEN, 'Failed for [null]: Refresh token is not in database.');
      return;
    }
    const refreshTokenObj = await RefreshToken.findOne({token});
    if (!refreshTokenObj) {
      Error.printError(req, res, Error.status.SC_FORBIDDEN, `Failed for [${token}]: Refresh token is not in database.`);
      return;
    }
    const isExpired = await RefreshTokenService.verifyExpiration(refreshTokenObj);
    if (isExpired) {
      Error.printError(req, res, Error.status.SC_FORBIDDEN, `Failed for [${token}]: Refresh token was expired. Please make a new sign in request.`);
      return;
    }
    const username = refreshTokenObj.username;
    const user = await User.findOne({username});
    if (!user) {
      Error.printError(req, res, Error.status.SC_FORBIDDEN, `Failed for [${token}]: User is not found.`);
      return;
    }
    if (!user.accountNonLocked) {
      Error.printError(req, res, Error.status.SC_UNAUTHORIZED, 'Too many invalid attempts. Account is locked!!');      
      return;
    }
    if (!user.enabled) {
      Error.printError(req, res, Error.status.SC_UNAUTHORIZED, 'Account is disabled.');
      return;
    }
    const accessToken = JwtTokenService.generate(user.username);
    res.status(Error.status.SC_OK).json({
      username: user.username,
      accessToken,
      roles: user.roles
    });
  }

  async changePassword(req: Request, res: Response) {
    const { username, password } = req.body;
    const user: IUser = req.params.signedInuser as any;
    if (user.username !== username) {
      Error.printError(req, res, Error.status.SC_FORBIDDEN, 'Can not change password for other user.');
      return;
    }
    const updatedUser = await User.findOne({username});
    if (!updatedUser) {
      Error.printError(req, res, Error.status.SC_INTERNAL_SERVER_ERROR, 'Unexpected Error has occurred.');
      return;
    }
    updatedUser.password = password;
    await updatedUser.save();
    req.body.password = null;
    res.status(Error.status.SC_OK).json(req.body);
  }
}

export default new JwtController;