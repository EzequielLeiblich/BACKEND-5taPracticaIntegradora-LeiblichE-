import { Router } from "express";
import TicketController from '../controllers/ticketsController.js'

const ticketRouter = Router();

let ticketController = new TicketController();

ticketRouter.post("/", async (req, res, next) => {
    const result = await ticketController.createTicketController(req, res, next);
    if(result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

ticketRouter.get("/:tid", async (req, res, next) => {
    const result = await ticketController.getTicketByIdController(req, res, next);
    if(result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

export default ticketRouter;