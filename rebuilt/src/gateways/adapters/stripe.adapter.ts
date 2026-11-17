import Stripe from "stripe";


import type { PaymentGateway, PaymentRequest, PaymentResult } from '../payment_gateway.interface.js';

export class StripeAdapter  implements PaymentGateway{
    private readonly stripe: Stripe;
    constructor(){
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if(!stripeSecretKey){
            throw new Error("Stripe secret key is not defined in environment variables.");
        }
        this.stripe = new Stripe(stripeSecretKey);
    }

    private toSmallestUnit(amount:number,currency:string):number{
        if(!Number.isFinite(amount) || amount <= 0){
            throw new Error("Amount must be a positive number.");
        }
        const digits=new Intl.NumberFormat("en-US",{style:"currency",currency:currency}).formatToParts(1.1).find(part=>part.type==="fraction")?.value.length||2;
        const result=Math.round(amount*Math.pow(10,digits));
        if(result<=0 || !Number.isSafeInteger(result)){
            throw new Error("Amount is too small to convert to the smallest unit.");
        }
        return result;
    }

    // normliased stripe statuses to generic statuses
    private normalizeStatus(status:Stripe.PaymentIntent.Status):string{
        switch(status){
            case 'succeeded':
                return 'success';
            case 'failed':
                return 'failed';
            case 'requires_payment_method':
                return "INITIATED";
            case "canceled":
                return "CANCELED";
            default:
                return "Processing";
        }
    }

    // create a stripe paymentIntent
    async createPayment(request: PaymentRequest): Promise<PaymentResult> {
        const payemntIntent=await this.stripe.paymentIntents.create({
            amount:this.toSmallestUnit(request.amount,request.currency),
            currency:request.currency.toLocaleLowerCase(),
            automatic_payment_methods:{enabled:true},
            metadata:{
                userId:request.userId,
                ...Object.fromEntries(Object.entries(request.metadata||{}).map(([key,value])=>[key,JSON.stringify(value)]))
            }
            
        });
        return {
            transactionId: payemntIntent.id,
            status: this.normalizeStatus(payemntIntent.status),
            gateway: 'STRIPE',
            ...(payemntIntent.client_secret !== null && { clientSecret: payemntIntent.client_secret }),

        };
    }

    // retrive stripe paymentIntent status 
    async getPaymentStatus(transactionId: string): Promise<PaymentResult> {
        const payemntIntent=await this.stripe.paymentIntents.retrieve(transactionId);
        return {
            transactionId: payemntIntent.id,
            status: this.normalizeStatus(payemntIntent.status),
            gateway: 'STRIPE',
            ...(payemntIntent.client_secret !== null && { clientSecret: payemntIntent.client_secret }),
        };
    }

    // refund stripe paymentIntent
    async refundPayment(transactionId: string, amount?: number): Promise<PaymentResult>{
        const refund=await this.stripe.refunds.create({
            payment_intent: transactionId,
               ...(amount !== undefined
        ? {
            amount: this.toSmallestUnit(
              amount,
              "INR"
            ),
          }
        : {})
        });

        let status="Processing";
        if(refund.status==="succeeded"){
            status="success";
        }else if(refund.status==="failed"){
            status="failed";
        }else if(refund.status==="canceled"){
            status="CANCELED";
        }
        return {
            transactionId: transactionId,   
            status: status,
            gateway: 'STRIPE',
            ...(refund.id !== null && { REFUND_ID: refund.id }),
        }
       
    }
}