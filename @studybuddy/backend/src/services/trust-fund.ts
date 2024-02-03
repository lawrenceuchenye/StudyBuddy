import { HydratedDocument } from "mongoose"
import { ITrustFund } from "../models/trust-fund"
import { IUser } from "../models/user"
import PaymentService from "./payment"

namespace TrustFundService {
  type TrustFundMetadata = {
    trustFundId: string
    payerId: string
  }

  export const getPaymentLink = async (trustFund: HydratedDocument<ITrustFund>, amount: number, user: HydratedDocument<IUser>) => {
    const paymentLink = await PaymentService.getPaymentLink({
      user,
      amount,
      metadata: {
        trustFundId: trustFund._id.toString(),
        payerId: user._id.toString()
      } as TrustFundMetadata
    })

    if (!paymentLink)
      return null

    return paymentLink
  }
}

export default TrustFundService
