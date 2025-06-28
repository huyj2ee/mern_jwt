import express, { Router } from 'express';
import userController from '../controllers/UserController';
import jwtMiddleware from '../middleware/jwtMiddleware';

const router:Router = express.Router();

router.post('/users', jwtMiddleware, userController.create);
router.get('/users', jwtMiddleware, userController.browse);
router.get('/users/:username', jwtMiddleware, userController.filterByUsername);
router.delete('/users/:username', jwtMiddleware, userController.delete);
router.put('/users/:username', jwtMiddleware, userController.edit);

export default router;
