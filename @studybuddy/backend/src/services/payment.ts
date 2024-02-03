import { Paystack } from 'paystack-sdk';
import config from '../config';
import { HydratedDocument } from 'mongoose';
import { IUser } from '../models/user';
import TransactionRepository from '../repositories/transaction';

namespace PaymentService {
  const paystack = new Paystack(config.paystack.secretKey);

  type GetPaymentLinkProps = {
    amount: number
    metadata: Record<string, unknown>
    user: HydratedDocument<IUser>
  }

  export const getPaymentLink = async ({ user, amount, metadata }: GetPaymentLinkProps) => {
    const res = await paystack.transaction.initialize({
      email: user.personalInformation?.email ?? "",
      amount: String(amount * 100),
      metadata
    })

    if (res.data) {
      const paymentLink = res.data.authorization_url

      await TransactionRepository.createTransaction({
        reference: res.data.reference,
        amount,
        metadata,
        creatorId: user._id
      })

      return paymentLink
    }

    return null
  }
}

export default PaymentService
