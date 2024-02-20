import { HydratedDocument } from "mongoose"
import { ITrustFund } from "../models/trust-fund"
import { IUser } from "../models/user"
import PaymentService from "./payment"

namespace TrustFundService {
  export type TrustFundMetadata = {
    type: "trust-fund"
    trustFundId: string
    payerId: string
  }

  export const getPaymentLink = async (trustFund: HydratedDocument<ITrustFund>, amount: number, user: HydratedDocument<IUser>) => {
    const paymentLink = await PaymentService.getPaymentLink({
      user,
      amount,
      metadata: {
        type: "trust-fund",
        trustFundId: trustFund._id.toString(),
        payerId: user._id.toString()
      } as TrustFundMetadata
    })

    if (!paymentLink)
      return null

    return paymentLink
  }

  export const withdrawFromTrustFund = async (trustFund: HydratedDocument<ITrustFund>) => {
    const recipientId = trustFund.accountDetails.recipientId

    if (!recipientId)
      return false

    return PaymentService.withdrawAmount({
      amount: trustFund.balance,
      recipient: recipientId
    })
  }
}

export default TrustFundService
