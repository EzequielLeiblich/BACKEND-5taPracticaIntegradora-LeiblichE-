import ProductService from '../services/products.service.js';
import mongoose from 'mongoose';

import ErrorEnums from "../errors/error.enums.js";
import CustomError from "../errors/customError.class.js";
import ErrorGenerator from "../errors/error.info.js";

export default class ProductController {
    constructor() {
        this.productService = new ProductService();
    }
    // Métodos ProductController:
    async createProductController(req, res, next) {
        const productData = req.body;
        try {
            if (!productData.title || typeof productData.title === 'number' || !productData.description || typeof productData.description === 'number' || !productData.code || typeof productData.code === 'number' || !productData.price || typeof productData.price === 'string' || productData.price <= 0 || !productData.stock || typeof productData.stock === 'string' || productData.stock <= 0 || !productData.category || typeof productData.category === 'number' || !productData.thumbnails || Object.keys(productData).length === 0)
            {
                CustomError.createError({
                    name: "Error al crear el nuevo producto.",
                    cause: ErrorGenerator.generateProductDataErrorInfo(productData),
                    message: "La información para crear el producto está incompleta o no es válida.",
                    code: ErrorEnums.INVALID_PRODUCT_DATA
                });
            }
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const ownerRole = req.user.role;
            let owner = ""
            if (ownerRole === "premium") {
                owner = req.user.userID;
            } else if (ownerRole === "admin") {
                owner = req.user.role;
            }
            productData.owner = owner
            const resultService = await this.productService.createProductService(productData);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                const products = await this.productService.getAllProductsService();
                req.socketServer.sockets.emit('products', products.result);
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al crear el producto - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async getProductByIDController(req, res, next) {
        const pid = req.params.pid;
        try {
            if (!pid || !mongoose.Types.ObjectId.isValid(pid)) {
                CustomError.createError({
                    name: "Error al obtener el producto por ID.",
                    cause: ErrorGenerator.generatePidErrorInfo(pid),
                    message: "El ID de producto proporcionado no es válido.",
                    code: ErrorEnums.INVALID_ID_PRODUCT_ERROR
                });
            }
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.productService.getProductByIdService(pid);
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
            response.message = "Error al obtener el producto por ID - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async getAllProductsController(req, res) {
        let response = {};
        try {
            const limit = Number(req.query.limit) || 10;
            const page = Number(req.query.page) || 1;
            let sort = (req.query.sort !== undefined) ? Number(req.query.sort) : 1;
            console.log(sort)
            let filtro = req.query.filtro || null;
            let filtroVal = req.query.filtroVal || null;
            const resultService = await this.productService.getAllProductsService(limit, page, sort, filtro, filtroVal);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                response.hasNextPage = resultService.hasNextPage;
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al obtener los productos - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async deleteProductController(req, res, next) {
        const pid = req.params.pid;
        try {
            if (!pid || !mongoose.Types.ObjectId.isValid(pid)) {
                CustomError.createError({
                    name: "Error al eliminar el producto por ID.",
                    cause: ErrorGenerator.generatePidErrorInfo(pid),
                    message: "El ID de producto proporcionado no es válido.",
                    code: ErrorEnums.INVALID_ID_PRODUCT_ERROR
                });
            }
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const ownerRole = req.user.role;
            const owner = ownerRole === "premium" ? req.user.userID : ownerRole === "admin" ? req.user.role : undefined;
            const resultService = await this.productService.deleteProductService(pid, owner);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404 || resultService.statusCode === 401) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                const products = await this.productService.getAllProductsService();
                req.socketServer.sockets.emit('products', products.result);
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al eliminar el producto - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async updatedProductController(req, res, next) {
        const pid = req.params.pid;
        const updatedFields = req.body;
        try {
            if (!pid || !mongoose.Types.ObjectId.isValid(pid)) {
                CustomError.createError({
                    name: "Error al intentar actualizar el producto.",
                    cause: ErrorGenerator.generatePidErrorInfo(pid),
                    message: "El ID de producto proporcionado no es válido",
                    code: ErrorEnums.INVALID_ID_PRODUCT_ERROR
                });
            } else if (!updatedFields || Object.keys(updatedFields).length === 0) {
                let infoUp = JSON.stringify(updatedFields, null, 2);
                CustomError.createError({
                    name: "Error al intentar actualizar el producto.",
                    cause: ErrorGenerator.generateEmptyUpdateFieldsErrorInfo(infoUp),
                    message: "No se proporcionaron campos válidos para la actualización del producto.",
                    code: ErrorEnums.INVALID_UPDATED_PRODUCT_FIELDS
                });
            };
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const ownerRole = req.user.role;
            const owner = ownerRole === "premium" ? req.user.userID : ownerRole === "admin" ? req.user.role : undefined;
            const resultService = await this.productService.updateProductService(pid, updatedFields, owner);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404 || resultService.statusCode === 403 || resultService.statusCode === 409) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                const products = await this.productService.getAllProductsService();
                req.socketServer.sockets.emit('products', products.result);
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al actualizar el producto - Controller:" + error.message;
            req.logger.error(response.message);
        };
        return response;
    };
}