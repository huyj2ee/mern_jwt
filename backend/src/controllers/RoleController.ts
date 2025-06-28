import { Request, Response } from 'express';
import Error from '../utils/Error';
import Role from '../models/Role';
import User from '../models/User';

class RoleController {
  async getAll(req: Request, res: Response) {
    const roles = await Role.find();
    const result = roles.map ((role) => {
      return {role: role.role};
    });
    res.status(Error.status.SC_OK).json(result);
  }

  async getAssigned(req: Request, res: Response) {
    const username = req.params.username;
    const user = await User.findOne({username});
    if (!user) {
      Error.printError(req, res, Error.status.SC_NOT_FOUND, `User with username ${username} is not found.`);
      return;
    }
    let result:Array<{role: string}> = [];
    if (user.roles) {
      result = user.roles.map((role): {role: string} => {
        return {role};
      });
    }
    res.status(Error.status.SC_OK).json(result);
  }

  async assign(req: Request, res: Response) {
    const {username, role} = req.params;
    const user = await User.findOne({username});
    if (!user) {
      Error.printError(req, res, Error.status.SC_NOT_FOUND, `Username ${username} is not found.`);
      return;
    }
    const roleObj = await Role.findOne({role});
    if (!roleObj) {
      Error.printError(req, res, Error.status.SC_NOT_FOUND, `Role ${role} is not found.`);
      return;
    }
    user.roles = [...user.roles, role];
    await user.save();
    res.status(Error.status.SC_OK).json({role});
  }

  async revoke(req: Request, res: Response) {
    const {username, role} = req.params;
    const user = await User.findOne({username});
    if (!user) {
      Error.printError(req, res, Error.status.SC_NOT_FOUND, `Username ${username} is not found.`);
      return;
    }
    const roleObj = await Role.findOne({role});
    if (!roleObj) {
      Error.printError(req, res, Error.status.SC_NOT_FOUND, `Role ${role} is not found.`);
      return;
    }
    if (!user.roles.includes(role)) {
      Error.printError(req, res, Error.status.SC_BAD_REQUEST, `Role ${role} is not an assigned role of user.`);
      return;
    }
    user.roles = user.roles.filter(r => r !== role);
    await user.save();
    res.status(Error.status.SC_NO_CONTENT).send();
  }
};

export default new RoleController;
