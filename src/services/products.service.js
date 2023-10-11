import ProductsDAO from "../DAO/mongodb/ProductsMongo.dao.js";

export default class ProductService {
    constructor() {
        this.productDao = new ProductsDAO();
    };
    
    async createProductService(info) {
        let response = {};
        try {
            const resultDAO = await this.productDao.createProduct(info);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Producto creado exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al crear el producto - Service: " + error.message;
        };
        return response;
    };

    async getProductByIdService(pid) {
        let response = {};
        try {
            const resultDAO = await this.productDao.getProductById(pid);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found product") {
                response.statusCode = 404;
                response.message = `No se encontró ningún producto con el ID ${pid}.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Producto obtenido exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al obtener el producto por ID - Service: " + error.message;
        };
        return response;
    };

    async getAllProductsService(limit, page, sort, filtro, filtroVal) {
        let response = {};
        try {
            const resultDAO = await this.productDao.getAllProducts(limit, page, sort, filtro, filtroVal);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found products") {
                response.statusCode = 404;
                response.message = `No se encontraron productos. El resultado fue de ${resultDAO.result.products.docs.length} productos.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Productos obtenidos exitosamente.";
                response.result = resultDAO.result.products;
                response.hasNextPage = resultDAO.result.hasNextPage;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al obtener los productos - Service: " + error.message;
        };
        return response;
    };

    async deleteProductService(pid, owner) {
        let response = {};
        try {
            const productInfo = await this.productDao.getProductById(pid);
            if (productInfo.status === "error") {
                response.statusCode = 500;
                response.message = productInfo.message;
            } else if (productInfo.status === "not found product") {
                response.statusCode = 404;
                response.message = `No se encontro ningún producto con el ID ${pid}.`;
            } else if (productInfo.status === "success") {
                if (owner === "admin" || productInfo.result.owner === owner) {
                    const resultDAO = await this.productDao.deleteProduct(pid);
                    if (resultDAO.status === "error") {
                        response.statusCode = 500;
                        response.message = resultDAO.message;
                    } else if (resultDAO.status === "not found product") {
                        response.statusCode = 404;
                        response.message = `No se encontró ningún producto con el ID ${pid}.`;
                    } else if (resultDAO.status === "success") {
                        response.statusCode = 200;
                        response.message = "Producto eliminado exitosamente.";
                        response.result = resultDAO.result;
                    };
                } else {
                    response.statusCode = 403;
                    response.message = "Solo puedes eliminar los productos que te pertenecen.";
                };
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al eliminar el producto - Service: " + error.message;
        };
        return response;
    };

    async deleteAllPremiumProductService(uid, userRequestId, role) {
        let response = {};
        try {
            if (role === "admin" || uid === userRequestId) {
                const resultDAO = await this.productDao.deleteAllPremiumProduct(uid);
                if (resultDAO.status === "error") {
                    response.statusCode = 500;
                    response.message = resultDAO.message;
                } else if (resultDAO.status === "not found products") {
                    response.statusCode = 404;
                    response.message = `No se encontraron productos para eliminar.`;
                } else if (resultDAO.status === "success") {
                    response.statusCode = 200;
                    response.message = resultDAO.message
                };
            } else { 
                response.statusCode = 403;
                response.message = "Solo puedes eliminar los productos que te pertenecen.";
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al eliminar todos los productos de usuario premium - Service: " + error.message;
        };
        return response;
    };

    async updateProductService(pid, updateProduct, owner) {
        let response = {};
        try {
            const productInfo = await this.productDao.getProductById(pid);
            if (productInfo.status === "error") {
                response.statusCode = 500;
                response.message = productInfo.message;
            } else if (productInfo.status === "not found product") {
                response.statusCode = 404;
                response.message = `No se encontró ningún producto con el ID ${pid}.`;
            } else if (productInfo.status === "success") {
                if (owner === "admin" || productInfo.result.owner === owner) {
                    const resultDAO = await this.productDao.updateProduct(pid, updateProduct);
                    if (resultDAO.status === "error") {
                        response.statusCode = 500;
                        response.message = resultDAO.message;
                    } else if (resultDAO.status === "not found product") {
                        response.statusCode = 404;
                        response.message = `No se encontró ningún producto con el ID ${pid}.`;
                    } else if (resultDAO.status === "update is equal to current") {
                        response.statusCode = 409;
                        response.message = 'La actualización es igual a la versión actual de los datos del producto.'
                    } else if (resultDAO.status === "success") {
                        response.statusCode = 200;
                        response.message = "Producto actualizado exitosamente.";
                        response.result = resultDAO.result;
                    };
                } else {
                    response.statusCode = 403;
                    response.message = "Solo puedes modificar los productos que te pertenecen.";
                };
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al actualizar el producto - Service: " + error.message;
        };
        return response;
    };

};