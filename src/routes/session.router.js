import { Router } from "express";
import passport from "passport";
import {completeProfile} from '../config/formExtra.js'
import { registerUser, loginUser, getCurrentUser, authenticateWithGitHub, getProfileUser} from './middlewares/passport.middleware.js';
import SessionController from '../controllers/sessionController.js';
import { rolesMiddlewareUser } from "./Middlewares/roles.middleware.js";

const sessionRouter = Router();
let sessionController = new SessionController();

// REGISTRO
sessionRouter.post('/register', registerUser);

//LOGIN
sessionRouter.post('/login', loginUser);

// GITHUB
sessionRouter.get('/github', passport.authenticate('github', { session: false, scope: 'user:email' }));
sessionRouter.get('/githubcallback', authenticateWithGitHub);

// FORMULARIO COMPLETO
sessionRouter.post('/completeProfile', completeProfile);

// CURRENT
sessionRouter.get('/current', passport.authenticate('jwt', { session: false }), getCurrentUser);

// PERFIL USUARIO
sessionRouter.get('/profile', passport.authenticate('jwt', { session: false }), getProfileUser);

// EMAIL RESET PASS:
sessionRouter.post('/requestResetPassword', passport.authenticate('jwt', { session: false }), rolesMiddlewareUser, async (req, res, next) => {
    const result = await sessionController.getSessionAndSendEmailController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// RESET USER PASS:
sessionRouter.post('/resetPassword', passport.authenticate('jwt', { session: false }), rolesMiddlewareUser, async (req, res, next) => {
    const result = await sessionController.resetPassSessionController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// LOGOUT:
sessionRouter.post('/logout', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    const result = await sessionController.logoutController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
}
);

// DELETE ACCOUNT:
sessionRouter.post('/deleteAccount', passport.authenticate('jwt', { session: false }), rolesMiddlewareUser, 
    async (req, res, next) => {
        const result = await sessionController.deleteAccountController(req, res, next);
        if (result !== undefined) {
            res.status(result.statusCode).send(result);
        };
    }
);

export default sessionRouter;