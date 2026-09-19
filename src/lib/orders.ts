import { prisma } from "./db";

export async function reconcilePaidPayment(orderId: string) {
  return prisma.$transaction(async tx => {
    const payment = await tx.payment.findUnique({
      where: { orderId },
      include: { order: { include: { items: true } } }
    });
    if (!payment) throw new Error("Payment not found.");
    if (payment.status === "PAID") return payment.order;

    for (const item of payment.order.items) {
      const updated = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } }
      });
      if (updated.count !== 1) throw new Error("Inventory changed. Payment requires manual reconciliation.");
    }

    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", verifiedAt: new Date(), failureReason: null }
    });
    return tx.order.update({
      where: { id: orderId },
      data: { paymentStatus: "PAID", status: "CONFIRMED" }
    });
  });
}