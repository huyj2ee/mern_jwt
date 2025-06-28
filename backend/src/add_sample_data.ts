import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User';
import Env from './utils/Env';

dotenv.config();

const createUnlockedUsers = async() =>  {
  for (let i=1; i <= 30; i++) {
    const username = 'dev' + String(i).padStart(2, '0');
    const password = 'abcd1234'
    const user = new User({ username, password, accountNonLocked: true, enabled: true, roles: [] });
    await user.save();
  }
  console.log('Unlocked users created.');
}

const createLockedUsers = async() =>  {
  for (let i=31; i <= 60; i++) {
    const username = 'dev' + String(i).padStart(2, '0');
    const password = 'abcd1234'
    const user = new User({ username, password, accountNonLocked: false, enabled: true, roles: [] });
    await user.save();
  }
  console.log('Locked users created.');
}

const main = async() => {
  try {
    await mongoose.connect(Env.getStr('DB_URL'), {});
    console.log('DB connected.');
    await createUnlockedUsers();
    await createLockedUsers();
  } catch (error: any) {
    console.log(`error : ${error.message}`);
  }
  process.exit();
}

main();