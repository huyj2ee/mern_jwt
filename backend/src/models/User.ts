import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  username: string;
  password: string;
  accountNonLocked: boolean;
  enabled: boolean;
  lastSignout?: Date;
  roles: string[];
  attempts?: number;
};

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  accountNonLocked: {
    type: Boolean,
    required: true
  },
  enabled: {
    type: Boolean,
    required: true
  },
  lastSignout: {
    type: Date,
    required: false
  },
  roles: {
    type: [String],
    required: true
  },
  attempts: {
    type: Number,
    required: false
  }
});

// Hash the password before saving to the database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
