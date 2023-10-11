import { Router } from 'express';
import passport from 'passport';
import UserController from '../controllers/userController.js'
import { rolesMiddlewareUser } from "./middlewares/roles.middleware.js";
import { uploaderDocuments } from './middlewares/multer.middleware.js'

const userRouter = Router();

let userController = new UserController();


// POST USER DOCUMENTS
userRouter.post('/:uid/documents',  passport.authenticate('jwt', {
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
}), rolesMiddlewareUser, async (req, res, next) => {
    const result = await userController.changeRoleController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

export default userRouter;