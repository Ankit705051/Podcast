
import type {Request,Response,NextFunction} from "express"
import { AppError } from "../utils/AppError.js"


export const notFoundHandler=(
    req:Request,
    res:Response,
    next:NextFunction
)=>{
    next(
        new AppError(
            `Route ${req.method} ${req.originalUrl} not found`,
            404,
            "ROUTE_NOT_FOUND"
        )
    )
    
};

