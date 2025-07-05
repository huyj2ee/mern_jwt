import { Request, Response } from 'express';
import RefreshToken from "../models/RefreshToken";
import User, { IUser }  from '../models/User';
import Error from '../utils/Error';

class UserController {
  async create(req: Request, res: Response) {
    const {username, password, enabled, accountNonLocked} = req.body as any;
    if (accountNonLocked === false) {
      Error.printError(req, res, Error.status.SC_BAD_REQUEST, 'accountNonLocked must be null or true or not provided.');
      return;
    }
    if (!username || !password || (enabled === undefined || enabled === null)) {
      Error.printError(req, res, Error.status.SC_BAD_REQUEST, 'username or password or enable is null.');
      return;
    }
    const user = await User.findOne({username});
    if (user) {
      Error.printError(req, res, Error.status.SC_BAD_REQUEST, `username ${username} already exists.`);
      return;
    }
    const newUser = new User({ username, password, accountNonLocked: true, enabled, roles: [] });
    await newUser.save();
    res.status(Error.status.SC_OK).json({
      username,
      password: null,
      enabled,
      accountNonLocked: true
    });
  }

  async browse(req: Request, res: Response) {
    let {page, accountNonLocked} = req.query;
    if (!page) {
      Error.printError(req, res, Error.status.SC_FORBIDDEN, 'Page query parameter is required, access all user list at a time is prohibited.');
      return;
    }
    let intPage: number = parseInt(page as string, 10);
    if (intPage < 0) {
      Error.printError(req, res, Error.status.SC_BAD_REQUEST, 'Page parameter must not be less than zero.');
      return;
    }
    let users = [];
    let total = 0;
    if (accountNonLocked) {
      const boolAccountNonLocked: boolean = (accountNonLocked === 'true');
      users = await User.find({accountNonLocked: boolAccountNonLocked}).sort({username: 1}).skip(intPage * 20).limit(20);
      total = await User.countDocuments({accountNonLocked: boolAccountNonLocked});
    }
    else {
      users = await User.find().sort({username: 1}).skip(intPage * 20).limit(20);
      total = await User.countDocuments({});
    }
    const result = users.map((user) => {
      return {
        username: user.username,
        password: null,
        enabled: user.enabled,
        accountNonLocked: user.accountNonLocked
      };
    });
    res.header('Pagination-Count', ((Math.floor((total-1) / 20)) + 1).toString());
    res.header('Pagination-Page', intPage.toString());
    res.header('Pagination-Limit', '20');
    res.status(Error.status.SC_OK).json(result);
  }

  async filterByUsername(req: Request, res: Response) {
    const username = req.params.username;
    const user = await User.findOne({username});
    if (user) {
      res.status(Error.status.SC_OK).json({
        username: user.username,
        password: null,
        enabled: user.enabled,
        accountNonLocked: user.accountNonLocked
      });
    }
    else {
      Error.printError(req, res, Error.status.SC_NOT_FOUND, `User with username ${username} is not found.`);
    }
  }

  async delete(req: Request, res: Response) {
    const username = req.params.username;
    const signedInuser: IUser = req.params.signedInuser as any;
    const user = await User.findOne({username});
    if (!user) {
      Error.printError(req, res, Error.status.SC_NOT_FOUND, `User ${username} is not found.`);
      return;
    }
    if (signedInuser.username === username) {
      Error.printError(req, res, Error.status.SC_BAD_REQUEST, 'Can not delete signed in user.');
      return;
    }
    await User.findByIdAndDelete(user._id);
    await RefreshToken.deleteOne({username});
    res.status(Error.status.SC_NO_CONTENT).send();
  }

  async edit(req: Request, res: Response) {
    const pathUsername = req.params.username;
    const signedInuser: IUser = req.params.signedInuser as any;
    const {username, password, enabled, accountNonLocked} = req.body;
    if (pathUsername !== username) {
      Error.printError(req, res, Error.status.SC_BAD_REQUEST, 'Property username is not same with path variable {username}.');
      return;
    }
    const user = await User.findOne({username});
    if (!user) {
      Error.printError(req, res, Error.status.SC_NOT_FOUND, `Username ${username} is not found.`);
      return;
    }
    if (password) {
      user.password = password;
    }
    if (enabled !== undefined && enabled !== null) {
      if (enabled === false && username === signedInuser.username) {
        Error.printError(req, res, Error.status.SC_BAD_REQUEST, 'Can not disable signed in user.');
        return;
      }
      user.enabled = enabled;
    }
    if (accountNonLocked !== undefined && accountNonLocked !== null) {
      user.accountNonLocked = accountNonLocked;
    }
    if (accountNonLocked === true) {
      user.attempts = 0;
    }
    await user.save();
    res.status(Error.status.SC_OK).json({
      username: user.username,
      password: null,
      enabled: user.enabled,
      accountNonLocked: user.accountNonLocked
    });
  }
}

export default new UserController;
