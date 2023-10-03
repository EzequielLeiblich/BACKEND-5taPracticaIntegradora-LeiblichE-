import { Router } from "express";
import ProductController from "../controllers/productsController.js";
import passport from "passport";

import { rolesMiddlewareAdminAndPremiun } from "./middlewares/roles.middleware.js";

const productsRouter = Router();
let productController = new ProductController();

productsRouter.post('/', passport.authenticate('jwt', { session: false }), rolesMiddlewareAdminAndPremiun, async (req, res, next) => {
  const result = await productController.createProductController(req, res, next);
  if(result !== undefined) {
    res.status(result.statusCode).send(result);
  };
});

productsRouter.get('/:pid', async (req, res, next) => { 
  const result = await productController.getProductByIDController(req, res, next);
  if (result !== undefined) {
    res.status(result.statusCode).send(result);
  };
});

productsRouter.get('/', async (req, res) => {
  const result = await productController.getAllProductsController(req, res);
  res.status(result.statusCode).send(result);
});

productsRouter.delete('/:pid', passport.authenticate('jwt', { session: false }), rolesMiddlewareAdminAndPremiun, async (req, res, next) => {
  const result = await productController.deleteProductController(req, res, next);
  if (result !== undefined) {
    res.status(result.statusCode).send(result);
  };
});

productsRouter.put('/:pid', passport.authenticate('jwt', { session: false }), rolesMiddlewareAdminAndPremiun, async (req, res, next) => {
  const result = await productController.updatedProductController(req, res, next);
  if (result !== undefined) {
    res.status(result.statusCode).send(result);
  };
});

export default productsRouter;