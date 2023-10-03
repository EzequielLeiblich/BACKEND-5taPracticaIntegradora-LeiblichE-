import jwt from 'jsonwebtoken';
import config from "../config.js";
import { createHash } from "../utils.js";

import SessionController from '../controllers/sessionController.js';

let sessionController = new SessionController();

export const completeProfile = async (req, res) => {
    const userId = req.signedCookies[config.JWT_USER]
    const last_name = req.body.last_name;
    const email = req.body.email;
    const age = parseInt(req.body.age, 10);
    const password = createHash(req.body.password);
    try {
        const updateUser = {
            last_name,
            email,
            age,
            password,
        };
        const updateSessionControl = await sessionController.updateUserController(req, res, userId, updateUser);
        if (updateSessionControl.statusCode === 200) {
            const userExtraForm = updateSessionControl.result;
            let token = jwt.sign({
                email: userExtraForm.email,
                first_name: userExtraForm.first_name,
                tickets: userExtraForm.tickets,
                role: userExtraForm.role,
                cart: userExtraForm.cart,
                userID: userExtraForm._id
            }, config.JWT_SECRET, {
                expiresIn: '7d'
            });
            res.cookie(config.JWT_COOKIE, token, {
                httpOnly: true,
                signed: true,
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            res.send({
                status: 'success',
                redirectTo: '/products'
            });
        };
    } catch (error) {
        req.logger.error(error.message)
        return ('Error al completar el perfil del usuario creado con GitHub - formExtra.js: ' + error.message);
    };
};