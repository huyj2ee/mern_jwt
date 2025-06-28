import express, { Router } from 'express';
import jwtController from '../controllers/JwtController';
import jwtMiddleware from '../middleware/jwtMiddleware';

const router:Router = express.Router();

router.post('/signin', jwtController.signIn);
router.post('/signout', jwtMiddleware, jwtController.signOut);
router.post('/refreshtoken', jwtController.refreshToken);
router.put('/password', jwtMiddleware, jwtController.changePassword);

export default router;
