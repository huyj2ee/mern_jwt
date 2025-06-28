import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import route from './routes';
import Env from './utils/Env';
import Error from './utils/Error';

dotenv.config();
const filePath = path.join(__dirname, '../public/index.html');
const app = express();

app.use(express.json());
app.use(cookieParser());
route(app);

// React files hosting
app.use(express.static('public'));
app.get('/{*any}', function(req, res){
  fs.readFile(filePath, {encoding: 'utf-8'}, function(err: any, data: any) {
    if (!err) {
      res.status(Error.status.SC_OK).send(data);
    }
    else {
      res.status(Error.status.SC_OK).send(err);
    }
  });
});

const main = async() => {
  try {
    await mongoose.connect(Env.getStr('DB_URL'), {});
    console.log('DB connected.');
    app.listen(process.env.APP_PORT, () => {
      console.log(`My blog app listening on port ${process.env.APP_PORT}.`);
    });
  } catch (error: any) {
    console.log(`error : ${error.message}`);
  }
}

main();