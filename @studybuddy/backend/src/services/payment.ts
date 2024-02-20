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
    const tx = await TransactionRepository.createTransaction({
      amount,
      creatorId: user._id
    })

    const res = await paystack.transaction.initialize({
      email: user.personalInformation?.email ?? "",
      amount: String(amount * 100),
      metadata
    })

    if (res.data) {
      const paymentLink = res.data.authorization_url


      return paymentLink
    }

    return null
  }

  type WithdrawPayload = {
    amount: number
    recipient: string
  }

  export const withdrawAmount = async ({ amount, recipient }: WithdrawPayload) => {
    const res = await paystack.transfer.initiate({
      amount: amount * 100,
      recipient,
      source: "balance",
    })

    if (res.status === 200) {
      return true
    }

    return false
  }
}

export default PaymentService
