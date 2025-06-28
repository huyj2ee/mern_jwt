import RefreshToken, { IRefreshToken } from '../models/RefreshToken';
import User from '../models/User';
import {v4 as uuidv4} from 'uuid';
import Env from './Env';

const RefreshTokenService = {
  create: async function (username: string):Promise<IRefreshToken> {
    let token = uuidv4();
    while ((await RefreshToken.find({token})).length > 0) {
      token = uuidv4();
    }
    const refreshTokens:IRefreshToken[] = await RefreshToken.find({username});
    const expireDuration = Env.getInt('REFRESHTOKEN_VALIDITY');
    const expiration = new Date(Date.now() + expireDuration);
    const issuedAt = new Date();
    if (refreshTokens.length > 0) {
      const refreshToken = refreshTokens[0];
      refreshToken.token = token;
      refreshToken.expiration = expiration;
      refreshToken.issuedAt = issuedAt;
      await refreshToken.save();
      return refreshToken;
    }
    else {
      const refreshToken = new RefreshToken({username, token, expiration, issuedAt});
      await refreshToken.save();
      return refreshToken;
    }
  },

  verifyExpiration: async function (refreshToken: IRefreshToken):Promise<boolean> {
    const username = refreshToken.username;
    const user = await User.findOne({username});
    if (!user) {
      return false;
    }
    let isExpired = user.lastSignout && user.lastSignout > refreshToken.issuedAt;
    isExpired = isExpired || refreshToken.expiration < (new Date());
    if (isExpired) {
      await RefreshToken.findByIdAndDelete(refreshToken._id);
    }
    return isExpired;
  }
};

export default RefreshTokenService;