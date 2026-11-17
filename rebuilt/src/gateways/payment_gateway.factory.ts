
import type { PaymentGateway } from './payment_gateway.interface.js';

import {StripeAdapter} from './adapters/stripe.adapter.js';
// import {payPalAdapter} from './adapters/paypal.adapter.js';
// import {razorpayAdapter} from './adapters/razorpay.adapter.js';


export type PaymentGatewayType = 'stripe' | 'paypal' | 'razorpay';  

export class PaymentGatewayFactory {
    static createPaymentGateway(gatewayType: PaymentGatewayType): PaymentGateway{
        switch(gatewayType){
            case 'stripe':
                return new StripeAdapter();
            // case 'paypal':
            //     return new payPalAdapter();
            // case 'razorpay':
            //     return new razorpayAdapter();
            default:
                throw new Error(`Unsupported payment gateway: ${gatewayType}`);
        }
    }
}