import SessionService from "../services/session.service.js";
import mongoose from 'mongoose';

import ErrorEnums from "../errors/error.enums.js";
import CustomError from "../errors/customError.class.js";
import ErrorGenerator from "../errors/error.info.js";

export default class SessionController {
    constructor() {
        this.sessionService = new SessionService();
    }
    // Métodos User Controller: 
    async createUserControler(req, res, info) {
        let response = {};
        try {
            const resultService = await this.sessionService.createUserService(info);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al registrar al usuario - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async getUserController(req, res, identifier) {
        let response = {};
        try {
            const resultService = await this.sessionService.getUserService(identifier);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al obtener el usuario - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async updateUserController(req, res, next, uid, updatedUser) {
        try {
            if (!uid || !mongoose.Types.ObjectId.isValid(uid)) {
                CustomError.createError({
                    name: "Error al actualizar al usuario por ID.",
                    cause: ErrorGenerator.generateUserIdInfo(uid),
                    message: "El ID de usuario proporcionado no es válido.",
                    code: ErrorEnums.INVALID_ID_USER_ERROR
                });
            }
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.sessionService.updateUserSevice(uid, updatedUser);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al actualizar los datos del usuario - Controller:" + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async getUserAndSendEmailController(req, res, next) {
        const userEmail = req.body.email;
        try {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!userEmail || !emailRegex.test(userEmail))
                CustomError.createError({
                    name: "Error en el proceso de restrablecer contraseña.",
                    cause: ErrorGenerator.generateResetPass1Info(userEmail),
                    message: "El correo está incompleto o no es válido.",
                    code: ErrorEnums.INVALID_EMAIL_USER
                });
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.sessionService.getUserAndSendEmailService(userEmail);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al enviar email para restablecer contraseña - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async resetPassUserController(req, res, next) {
        const userEmail = req.user.email;
        const newPass = req.body.newPassword
        const confirmPass = req.body.confirmPassword
        try {
            if (!newPass || !confirmPass || newPass !== confirmPass)
                CustomError.createError({
                    name: "Error en el proceso de restrablecer contraseña.",
                    cause: ErrorGenerator.generateResetPass2Info(),
                    message: "Las contraseñas estan incompletas o no coinciden.",
                    code: ErrorEnums.INVALID_NEW_PASS_USER
                });
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.sessionService.resetPassUser(userEmail, newPass);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404 || resultService.statusCode === 400) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al restablecer contraseña - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async logoutController(req, res, next) {
        const uid = req.user.userID;
        try {
            if (!uid || !mongoose.Types.ObjectId.isValid(uid)) {
                CustomError.createError({
                    name: "Error al cerrar session.",
                    cause: ErrorGenerator.generateUserIdInfo(uid),
                    message: "El ID de usuario proporcionado no es válido.",
                    code: ErrorEnums.INVALID_ID_USER_ERROR
                });
            }
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.sessionService.logoutService(req, res, uid);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al cerrar session - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async deleteUserController(req, res, next) {
        const uid = req.user.userID;
        const cid = req.user.cart;
        try {
            if (!uid || !mongoose.Types.ObjectId.isValid(uid)) {
                CustomError.createError({
                    name: "Error al eliminar cuenta.",
                    cause: ErrorGenerator.generateUserIdInfo(uid),
                    message: "El ID de usuario proporcionado no es válido.",
                    code: ErrorEnums.INVALID_ID_USER_ERROR
                });
            } else if (!cid || !mongoose.Types.ObjectId.isValid(cid)) {
                CustomError.createError({
                    name: "Error al eliminar cuenta.",
                    cause: ErrorGenerator.generateCidErrorInfo(cid),
                    message: "El ID de carrito proporcionado no es válido.",
                    code: ErrorEnums.INVALID_ID_CART_ERROR
                });
            }
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.sessionService.deleteUserService(uid, cid);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404 || resultService.statusCode === 400) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al eliminar cuenta - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };
    
};