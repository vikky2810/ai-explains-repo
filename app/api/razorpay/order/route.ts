import { NextRequest, NextResponse } from "next/server";

interface CreateOrderRequestBody {
  amount?: number; // amount in INR rupees
  note?: string;
  quantity?: number;
}

export async function POST(req: NextRequest) {
  try {
    const { amount, note, quantity }: CreateOrderRequestBody = await req.json();

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_API_KEY;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET_KEY;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay keys are not configured" }, { status: 500 });
    }

    const rupees = typeof amount === "number" && amount > 0 ? amount : 99; // default ₹99
    const paise = Math.round(rupees * 100);

    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        amount: paise,
        currency: "INR",
        receipt: `support_${Date.now()}`,
        notes: { purpose: "Support the project", note, quantity },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: "Failed to create order", details: text }, { status: 500 });
    }

    const order = await response.json();

    return NextResponse.json({
      keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


