import { Router } from 'express';
import passport from 'passport';
import UserController from '../controllers/userController.js'
import { rolesMiddlewareUser, rolesMiddlewareAdmin, rolesMiddlewarePublic } from "./middlewares/roles.middleware.js";
import { uploaderDocuments } from './middlewares/multer.middleware.js'

const userRouter = Router();

let userController = new UserController();


// POST USER DOCUMENTS
userRouter.post('/:uid/documents', passport.authenticate('jwt', {
    session: false
}), rolesMiddlewareUser, uploaderDocuments.fields([{
        name: 'identification',
        maxCount: 1
    },
    {
        name: 'proofOfAddress',
        maxCount: 1
    },
    {
        name: 'bankStatement',
        maxCount: 1
    }
]), async (req, res, next) => {
    const result = await userController.uploadPremiumDocsController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

//  CHANGE ROLE CONTROLLER 
userRouter.post('/premium/:uid', passport.authenticate('jwt', {
    session: false
}), rolesMiddlewarePublic, async (req, res, next) => {
    const result = await userController.changeRoleController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// GET ALL USERS
userRouter.get('/allUsers', passport.authenticate('jwt', {
    session: false
}), rolesMiddlewareAdmin, async (req, res) => {
    const result = await userController.getAllUsersController(req, res);
    res.status(result.statusCode).send(result);
});

// DELETE INECTIVE USERS (2 DAYS)
userRouter.delete('/deleteInactivityUsers', passport.authenticate('jwt', {
    session: false
}), rolesMiddlewareAdmin, async (req, res) => {
    const result = await userController.deleteInactivityUsersController(req, res);
    res.status(result.statusCode).send(result);
});

export default userRouter;