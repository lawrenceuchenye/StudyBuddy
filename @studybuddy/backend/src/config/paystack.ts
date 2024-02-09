import { env } from "../env";

const PaystackConfig = {
  secretKey: env.PAYSTACK_SECRET_KEY,
  publicKey: env.PAYSTACK_PUBLIC_KEY
}

export default PaystackConfig
