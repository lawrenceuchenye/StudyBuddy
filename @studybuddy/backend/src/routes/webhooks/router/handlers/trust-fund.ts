import { PaystackEvent } from "@studybuddy/backend/middleware/paystack";
import TrustFundRepository from "@studybuddy/backend/repositories/trust-fund";
import TrustFundService from "@studybuddy/backend/services/trust-fund";
import { Types } from "mongoose";

export default async (event: PaystackEvent, { trustFundId, payerId }: TrustFundService.TrustFundMetadata) => {
  const trustFund = await TrustFundRepository.getTrustFund(new Types.ObjectId(trustFundId))

  if (!trustFund)
    return

  await TrustFundRepository.updateTrustFund(trustFund._id, {
    balance: trustFund.balance + event.amount / 100
  })

  await TrustFundRepository.addTransaction(trustFund._id, {
    amount: event.amount / 100,
    payerId,
    trustFundId: trustFund._id
  })
}
