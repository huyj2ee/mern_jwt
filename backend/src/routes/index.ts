import { Express } from 'express';
import jwtRoute from './jwtRoute';
import userRoute from './userRoute';
import roleRoute from './roleRoute';

function route(app: Express) : void {
  const preFix = '/' + process.env.jwtPrefix + '/v1'
  app.use(preFix, jwtRoute);
  app.use(preFix, userRoute);
  app.use(preFix, roleRoute);
}

export default route;