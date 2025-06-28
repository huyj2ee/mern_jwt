import mongoose from 'mongoose';

export interface IRefreshToken extends mongoose.Document {
  username: string;
  token: string;
  expiration: Date;
  issuedAt: Date;
};

const refreshTokenSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  token : {
    type: String,
    required: true,
    unique: true
  },
  expiration: {
    type: Date,
    required: true
  },
  issuedAt: {
    type: Date,
    required: true
  }
});

const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);
export default RefreshToken;

