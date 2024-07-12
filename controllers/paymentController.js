const stripe = require("stripe")(
  "sk_test_51Pb2FvRs6tJ2YQKuZtbaRtrT4U4wdGZ87aZ1JDCsSGz6umkd8ux8UANHoB0KrIileWdPXbBYYMhxzBhNWhsQPFeN00m42aCSAJ"
);
const Payment = require("../models/Payment.model");

// Create a payment intent

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      // Add metadata if needed
    });
    res.status(201).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(400).json({ error: error.message });
  }
};

// Handle payment success
exports.handlePaymentSuccess = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status === "succeeded") {
      const payment = new Payment({
        cardId: paymentIntent.metadata.cardId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: "completed", // Adjust as per your Payment model
        paymentGateway: "stripe",
        transactionId: paymentIntent.id,
      });
      await payment.save();
      res.status(200).json(payment);
    } else {
      res.status(400).json({ error: "Payment not successful" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
