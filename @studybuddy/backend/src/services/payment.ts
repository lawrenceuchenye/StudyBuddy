namespace PaymentService {
  type GetPaymentLinkProps = {
    amount: number
    meta: unknown
  }

  export const getPaymentLink = async ({ amount, meta }: GetPaymentLinkProps) => {

  }
}

export default PaymentService
