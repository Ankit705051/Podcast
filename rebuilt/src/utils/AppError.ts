

export class AppError extends Error{
     public statusCode:number;
     public code?:string|undefined;

    constructor(
      message:string,
      statusCode:number = 500,
      code?:string
    ) {
      super(message);
      this.name="AppError";
      this.statusCode=statusCode;
      this.code=code;
      Error.captureStackTrace(this, this.constructor);
    }
}