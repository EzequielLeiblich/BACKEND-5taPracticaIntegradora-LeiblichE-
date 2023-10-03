import { Router } from 'express';
import UserController from '../controllers/userController.js'

const userRouter = Router();

let userController = new UserController();

//  CHANGE ROLE CONTROLLER 
userRouter.post('/premium/:uid', async (req, res, next) => {
    const result = await userController.changeRoleController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

export default userRouter;