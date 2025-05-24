import { LoanHandler } from "@/core/handlers/loan.handler";
import { createRouter } from "@/lib/app";
import { LoanRoutes } from "./loan.routes";

const routes = new LoanRoutes();
const handlers = new LoanHandler();

const router = createRouter()
	.openapi(routes.allLoans, handlers.getAllLoans)
	.openapi(routes.create, handlers.createLoan)
	.openapi(routes.return, handlers.returnLoan);

export default router;
