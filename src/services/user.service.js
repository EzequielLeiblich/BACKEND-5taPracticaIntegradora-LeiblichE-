import UserDAO from "../DAO/mongodb/UserMongo.dao.js";
import jwt from 'jsonwebtoken';
import config from "../config.js";

export default class SessionService {
    constructor() {
        this.userDAO = new UserDAO();
    }

    async changeRoleService(uid, res) {
        let response = {};
        try {
            const resultDAO = await this.userDAO.getUser(uid);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found user") {
                response.statusCode = 404;
                response.message = `Usuario no encontrado.`;
            } else if (resultDAO.status === "success") {
                let userRole = resultDAO.result.role;
                const newRole = userRole === "user" ? "premium" : "user";
                const updateUser = {
                    role: newRole
                };
                const resultRolPremium = await this.userDAO.updateUser(uid, updateUser);
                if (resultRolPremium.status === "error") {
                    response.statusCode = 500;
                    response.message = resultRolPremium.message;
                } else if (resultRolPremium.status === "not found user") {
                    response.statusCode = 404;
                    response.message = "Usuario no encontrado.";
                } else if (resultRolPremium.status === "success") {
                    response.statusCode = 200;
                    response.message = `Usuario actualizado exitosamente, su rol a sido actualizado a ${newRole}.`;
                    const newUser = await this.userDAO.getUser(uid);
                    let token = jwt.sign({
                        email: newUser.result.email,
                        first_name: newUser.result.first_name,
                        role: newUser.result.role,
                        cart: newUser.result.cart,
                        userID: newUser.result._id
                    }, config.JWT_SECRET, {
                        expiresIn: '7d'
                    });
                    res.cookie(config.JWT_COOKIE, token, {
                        httpOnly: true,
                        signed: true,
                        maxAge: 7 * 24 * 60 * 60 * 1000
                    })
                };
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al modificar el rol del usuario - Service: " + error.message;
        };
        return response;
    };

}