import CartDAO from "../DAO/mongodb/CartMongo.dao.js";
import ProductService from "./products.service.js";
import TicketService from "./tickets.service.js";

export default class CartService {
    constructor() {
        this.cartDao = new CartDAO();
        this.productService = new ProductService();
        this.ticketService = new TicketService();
    }

    // Métodos CartService:
    async createCartService() {
        let response = {};
        try {
            const resultDAO = await this.cartDao.createCart();
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Carrito creado exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al crear el carrito - Service: " + error.message;
        };
        return response;
    };

    async getCartByIdService(cid) {
        let response = {};
        try {
            const resultDAO = await this.cartDao.getCartById(cid);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found cart") {
                response.statusCode = 404;
                response.message = `No se encontró ningún carrito con ID ${cid}.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Carrito obtenido exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al obtener el carrito por ID - Service: " + error.message;
        };
        return response;
    };

    async getAllCartsService() {
        let response = {};
        try {
            const resultDAO = await this.cartDao.getAllCarts();
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found carts") {
                response.statusCode = 404;
                response.message = "No se han encontrado carritos.";
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Carritos obtenidos exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al obtener los carritos - Service: " + error.message;
        };
        return response;
    };

    async addProductToCartService(cid, pid, quantity, userId) {
        let response = {}
        try {
            const product = await this.productService.getProductByIdService(pid);
            if (product.statusCode === 500 || product.statusCode === 404) {
                response.statusCode = product.statusCode;
                response.message = product.message;
            } else {
                if (product.result.owner === undefined || !product.result.owner === userId) {
                    const resultDAO = await this.cartDao.addProductToCart(cid, product.result, quantity);
                    if (resultDAO.status === "error") {
                        response.statusCode = 500;
                        response.message = resultDAO.message;
                    } else if (resultDAO.status === "not found cart") {
                        response.statusCode = 404;
                        response.message = `No se encontró ningún carrito con ID ${cid}.`;
                    } else if (resultDAO.status === "success") {
                        response.statusCode = 200;
                        response.message = "Producto agregado al carrito exitosamente.";
                        response.result = resultDAO.result;
                    };
                } else if(product.result.owner === userId ){
                    response.statusCode = 401;
                    response.message = "No puedes agregar tus propios productos a tu carrito.";
                }
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al agregar el producto al carrito - Service: " + error.message;
        };
        return response;
    };

    async purchaseProductsInCartService(cartID, purchaseInfo, userEmail) {
        let response = {};
        try {
            const successfulProducts = [];
            const failedProducts = [];
            let totalAmount = 0;
            for (const productInfo of purchaseInfo.products) {
                const databaseProductID = productInfo.databaseProductID;
                const quantityToPurchase = productInfo.quantity;
                const productFromDB = await this.productService.getProductByIdService(databaseProductID);
                if (productFromDB.statusCode === 404 || productFromDB.statusCode === 500) {
                    failedProducts.push(productInfo);
                    continue;
                }
                else if (productFromDB.result.stock < quantityToPurchase) {
                    failedProducts.push(productInfo);
                    continue;
                }
                else if (productFromDB.result.stock >= quantityToPurchase) {
                    successfulProducts.push(productInfo);
                    totalAmount += productFromDB.result.price * quantityToPurchase;
                    continue;
                };
            };
            for (const productInfo of successfulProducts) {
                const databaseProductID = productInfo.databaseProductID;
                const quantityToPurchase = productInfo.quantity;
                const productFromDB = await this.productService.getProductByIdService(databaseProductID);
                const updatedProduct = {
                    stock: productFromDB.result.stock - quantityToPurchase
                };
                await this.productService.updateProductService(databaseProductID, updatedProduct);
                await this.deleteProductFromCartService(cartID, productInfo.cartProductID);
            };
            const ticketInfo = {
                successfulProducts: successfulProducts.map(productInfo => ({
                    product: productInfo.databaseProductID,
                    quantity: productInfo.quantity,
                    title: productInfo.title,
                    price: productInfo.price,
                })),
                failedProducts: failedProducts.map(productInfo => ({
                    product: productInfo.databaseProductID,
                    quantity: productInfo.quantity,
                    title: productInfo.title,
                    price: productInfo.price,
                })),
                purchase: userEmail,
                amount: totalAmount
            };
            const ticketServiceResponse = await this.ticketService.createTicketService(ticketInfo);
            if (ticketServiceResponse.statusCode === 500) {
                response.statusCode = 500;
                response.message = 'Error al crear el ticket para la compra. ' + ticketServiceResponse.message;
            }
            else if (ticketServiceResponse.statusCode === 200) {
                const ticketID = ticketServiceResponse.result._id;
                const resultDAO = await this.cartDao.addTicketToCart(cartID, ticketID);
                if (resultDAO.status === "not found cart") {
                    response.statusCode = 404;
                    response.message = `No se encontró ningún carrito con el ID ${cartID}.`;
                } else if (resultDAO.status === "error") {
                    response.statusCode = 500;
                    response.message = resultDAO.message;
                } else if (resultDAO.status === "success") {
                    response.statusCode = 200;
                    response.message = "Compra procesada exitosamente. El ticket ya ha sido agregado al carrito.";
                    response.result = ticketServiceResponse.result;
                };
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = 'Error al procesar la compra - Service: ' + error.message;
        };
        return response;
    };

    async deleteProductFromCartService(cid, pid) {
        let response = {};
        try {
            const resultDAO = await this.cartDao.deleteProductFromCart(cid, pid);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found cart") {
                response.statusCode = 404;
                response.message = `No se encontró ningún carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "not found product") {
                response.statusCode = 404;
                response.message = `No se encontró ningún producto con el ID ${pid}, en el carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Producto eliminado exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al borrar el producto en carrito - Service: " + error.message;
        };
        return response;
    };

    async deleteAllProductFromCartService(cid) {
        let response = {};
        try {
            const resultDAO = await this.cartDao.deleteAllProductsFromCart(cid);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found cart") {
                response.statusCode = 404;
                response.message = `No se encontró ningún carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "not found prod") {
                response.statusCode = 404;
                response.message = `No se encontraron productos en el carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Los productos del carrito se han eliminado exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al eliminar todos los productos del carrito - Service: " + error.message;
        };
        return response;
    };

    async updateCartService(cid, updatedCartFields) {
        const response = {};
        try {
            const resultDAO = await this.cartDao.updateCart(cid, updatedCartFields)
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found cart") {
                response.statusCode = 404;
                response.message = `No se encontró ningún carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "update is equal to current") {
                response.statusCode = 409;
                response.message = `La actualización es igual a la versión actual de los datos del carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Carrito actualizado exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al actualizar el carrito - Service: " + error.message;
        };
        return response;
    };

    async updateProductInCartService(cid, pid, quantity) {
        let response = {};
        try {
            const resultDAO = await this.cartDao.updateProductInCart(cid, pid, quantity)
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found cart") {
                response.statusCode = 404;
                response.message = `No se encontró ningún carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "not found product") {
                response.statusCode = 404;
                response.message = `No se encontró ningún producto con el ID ${pid}, en el carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "update is equal to current") {
                response.statusCode = 409;
                response.message = `La actualización es igual a la versión actual de los datos del carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Producto actualizado exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al actualizar el producto en el carrito - Service: " + error.message;
        };
        return response;
    };

    async deleteCartService(cid) {
        let response = {};
        try {
            const resultDAO = await this.cartDao.deleteCart(cid)
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found cart") {
                response.statusCode = 404;
                response.message = `No se encontró ningún carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Carrito eliminado exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al eliminar el carrito - Service: " + error.message;
        };
        return response;
    };

};