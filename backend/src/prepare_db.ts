import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User';
import Role from './models/Role';
import Env from './utils/Env';

dotenv.config();

const createRootUser = async() =>  {
  const username = 'root';
  const password = 'abcd1234';
  const user = new User({ username, password, accountNonLocked: true, enabled: true, roles: ['admin'] });
  await user.save();
  console.log('root user created.');
}

const createRoles = async() =>  {
  const roles = ['admin', 'developer', 'tester', 'pm', 'ba', 'ta'];
  for(let i = 0; i < roles.length; i++) {
    const role = new Role({role: roles[i]});
    await role.save();
  }
  console.log('roles created.');
}

const main = async() => {
  try {
    await mongoose.connect(Env.getStr('DB_URL'), {});
    console.log('DB connected.');
    await createRootUser();
    await createRoles();
  } catch (error: any) {
    console.log(`error : ${error.message}`);
  }
  process.exit();
}

main();