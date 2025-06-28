import express, { Router } from 'express';
import roleController from '../controllers/RoleController';
import jwtMiddleware from '../middleware/jwtMiddleware';

const router:Router = express.Router();

router.get('/roles', jwtMiddleware, roleController.getAll);
router.put('/users/:username/roles/:role', jwtMiddleware, roleController.assign);
router.delete('/users/:username/roles/:role', jwtMiddleware, roleController.revoke);
router.get('/users/:username/roles', jwtMiddleware, roleController.getAssigned);

export default router;
