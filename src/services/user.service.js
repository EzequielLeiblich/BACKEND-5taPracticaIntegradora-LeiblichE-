import UserDAO from "../DAO/mongodb/UserMongo.dao.js";
import jwt from 'jsonwebtoken';
import config from "../config.js";

export default class SessionService {
    constructor() {
        this.userDAO = new UserDAO();
    }

    async uploadPremiumDocsService(uid, documentsRuta, documentNames) {
        let response = {};
        try {
            const resultDAO = await this.userDAO.uploadPremiumDocs(uid, documentsRuta, documentNames);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found user") {
                response.statusCode = 404;
                response.message = "Usuario no encontrado.";
            } else if (resultDAO.status === "parcial success") {
                response.statusCode = 206;
                response.message = `Ya has proporcionado la documentación para ${resultDAO.result1}, sin embargo, la calidad de usuario premium tambien requiere la documentación de ${resultDAO.result2}. Una vez subidos todos los archivos estarás en condiciones de volverte premium.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = `Todos los documentos de ${resultDAO.result} se han cargado exitosamente, ahora estas en condiciones de convertirte en un usuario premium, para completar el proceso solo debes presionar en "Actualizar role", luego de ello puedes verificar el cambio de role en la sección de perfil.`;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al subir documentación de usuario - Service: " + error.message;
        };
        return response;
    };

    async changeRoleService(res, uid) {
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
                let docsSubidos = resultDAO.result.documents.map(doc => doc.name);
                let documentNames = ["Identificación", "Comprobante de domicilio", "Comprobante de estado de cuenta"];
                let documentosFaltantes = documentNames.filter(name => !docsSubidos.includes(name));
                let resultRolPremium
                if (newRole === "premium") {
                    if (docsSubidos.length === 3) {
                        resultRolPremium = await this.userDAO.updateUser(uid, updateUser);
                    } else {
                        response.statusCode = 422;
                        response.message = `No es posible efectuar el cambio de role a premium, ya que aún no se ha proporcionado toda la documentación requerida para dicha operación. Los documentos faltantes son  ${documentosFaltantes.join(', ')}.`;
                    }
                } else if (newRole === "user") {
                    resultRolPremium = await this.userDAO.updateUser(uid, updateUser);
                }
                if (documentosFaltantes.length === 0) {
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
                        }, envCoderSecret, {
                            expiresIn: '7d'
                        });
                        res.cookie(envCoderTokenCookie, token, {
                            httpOnly: true,
                            signed: true,
                            maxAge: 7 * 24 * 60 * 60 * 1000
                        })
                    };
                }
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al modificar el rol del usuario - Service: " + error.message;
        };
        return response;
    };

}