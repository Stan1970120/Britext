import Order from '../models/publishbook_order.model.js';

/**
 * handlePaymentSuccess
 * Logic triggered after payment gateway (Stripe/Paystack) confirms success.
 * This is the "Key" that unlocks the book for the user.
 */
export const handlePaymentSuccess = async (paymentData) => {
  try {
    // 1. Check if an order with this reference already exists 
    // (Prevents duplicate entries if webhooks retry)
    const existingOrder = await Order.findOne({ 
      paymentReference: paymentData.reference 
    });

    if (existingOrder) {
      return { success: true, message: "Order already processed" };
    }

    // 2. Create the new successful Order
    const newOrder = new Order({
      bookId: paymentData.bookId,
      userId: paymentData.userId,
      amountPaid: paymentData.amount,
      paymentReference: paymentData.reference,
      paymentStatus: 'completed'
    });

    await newOrder.save();

    console.log(`✅ Payment Success: Book ${paymentData.bookId} unlocked for User ${paymentData.userId}`);
    
    return { success: true, order: newOrder };
  } catch (error) {
    console.error("❌ Error handling payment success:", error);
    return { success: false, error: error.message };
  }
};