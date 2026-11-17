
export interface PaymentRequest{
    amount:number;
    currency:string;
    userId:string;
    metadata?:Record<string,any>
}

export interface PaymentResult{
    transactionId:string;
    status:string;
    gateway:string;
    clientSecret?:string;
    REFUND_ID?:string;
}

export interface PaymentGateway{
    createPayment(request:PaymentRequest):Promise<PaymentResult>
    getPaymentStatus(transactionId:string):Promise<PaymentResult>
    refundPayment(transactionId:string, amount?:number):Promise<PaymentResult>
}