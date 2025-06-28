import mongoose from 'mongoose';

export interface IRole extends mongoose.Document {
  role: string;
};

const roleSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    unique: true
  }
});

const Role = mongoose.model<IRole>('Role', roleSchema);
export default Role;
