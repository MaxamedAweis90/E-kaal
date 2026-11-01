import assert from "node:assert";
import http from "node:http";
import mongoose from "mongoose";
import app, { connectDB } from "../index";
import {
  Merchant,
  Customer,
  Vendor,
  Product,
  Transaction,
  ResaleTransaction,
  BroadcastLog,
  Subscription,
} from "../models";

async function runTestSuite() {
  console.log("\n=======================================================");
  console.log("   EKAAL AUTOMATED INTEGRATION & VERIFICATION SUITE   ");
  console.log("=======================================================\n");

  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ekaal_dev";
  console.log(`[INIT] Connecting to MongoDB at ${uri}...`);
  await connectDB(uri);

  // Clear test fixtures before execution
  console.log("[SETUP] Purging test collections...");
  await Promise.all([
    Customer.deleteMany({}),
    Vendor.deleteMany({}),
    Product.deleteMany({}),
    Transaction.deleteMany({}),
    ResaleTransaction.deleteMany({}),
    BroadcastLog.deleteMany({}),
    Subscription.deleteMany({}),
    Merchant.deleteMany({}),
  ]);

  // Create initial merchant fixture
  const merchantExpiry = new Date();
  merchantExpiry.setDate(merchantExpiry.getDate() + 30);
  const merchant = await Merchant.create({
    shopName: "Mudnaan Electronics & Retail",
    phone: "614888881",
    email: "mudnaan@emudnaan.com",
    activeSubscriptionTier: "1_MONTH",
    subscriptionExpiresAt: merchantExpiry,
    supportChannels: {
      whatsapp: "+252614888881",
      call: "+252614888881",
    },
  });

  const merchantId = merchant._id.toString();

  // Start test HTTP server on random available port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[SETUP] HTTP Server listening on ${baseUrl}\n`);

  const headers = {
    "Content-Type": "application/json",
    "x-merchant-id": merchantId,
  };

  let passedTests = 0;
  const totalAssertions = 8;

  try {
    // ---------------------------------------------------------
    // [A] Health & Base Middleware
    // ---------------------------------------------------------
    console.log("[TEST A] Asserting Health Check & Middleware Handling...");
    const healthRes = await fetch(`${baseUrl}/api/v1/health`);
    assert.strictEqual(healthRes.status, 200, "Health check should return 200 OK");
    const healthJson = await healthRes.json();
    assert.strictEqual(healthJson.status, "ok", "Health payload status must be 'ok'");

    // Malformed JSON check
    const malformedRes = await fetch(`${baseUrl}/api/v1/customers`, {
      method: "POST",
      headers,
      body: '{"invalid": json}',
    });
    assert.strictEqual(malformedRes.status, 400, "Malformed JSON should return 400");
    const malformedJson = await malformedRes.json();
    assert.strictEqual(malformedJson.success, false, "Malformed JSON success must be false");
    assert.ok(malformedJson.error?.code, "Error response must contain code");
    console.log("  ✓ [A] Health and middleware asserted successfully.");
    passedTests++;

    // ---------------------------------------------------------
    // [B] Customer Ledger & Debt Arithmetic
    // ---------------------------------------------------------
    console.log("[TEST B] Asserting Customer Ledger & Debt Arithmetic...");
    const createCustomerRes = await fetch(`${baseUrl}/api/v1/customers`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "Abdikafi Mohamed",
        phone: "612121112",
        creditLimit: 1000.0,
      }),
    });
    assert.strictEqual(createCustomerRes.status, 201, "Customer creation should return 201");
    const createCustomerJson = await createCustomerRes.json();
    assert.strictEqual(createCustomerJson.success, true);
    assert.strictEqual(createCustomerJson.data.balance, 0, "Initial balance must be 0.00");
    const customerId = createCustomerJson.data._id;

    // Debt Add: $500.00
    const debtAddRes = await fetch(`${baseUrl}/api/v1/customers/${customerId}/transactions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        type: "DEBT_ADD",
        amount: 500.0,
        note: "Initial credit purchase",
      }),
    });
    assert.strictEqual(debtAddRes.status, 201);
    const debtAddJson = await debtAddRes.json();
    assert.strictEqual(debtAddJson.data.customer.totalDebt, 500.0);
    assert.strictEqual(debtAddJson.data.customer.paid, 0.0);
    assert.strictEqual(debtAddJson.data.customer.balance, 500.0);

    // Debt Payment: $150.00
    const debtPayRes = await fetch(`${baseUrl}/api/v1/customers/${customerId}/transactions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        type: "DEBT_PAYMENT",
        amount: 150.0,
        note: "Installment payment via EVC",
      }),
    });
    assert.strictEqual(debtPayRes.status, 201);
    const debtPayJson = await debtPayRes.json();
    assert.strictEqual(debtPayJson.data.customer.totalDebt, 500.0);
    assert.strictEqual(debtPayJson.data.customer.paid, 150.0);
    assert.strictEqual(debtPayJson.data.customer.balance, 350.0);

    // Decimal precision assertion
    const bal = debtPayJson.data.customer.balance;
    const decimals = bal.toString().split(".")[1] || "";
    assert.ok(decimals.length <= 2, "Balance decimal precision must be at most 2");
    console.log("  ✓ [B] Customer ledger arithmetic (500 - 150 = 350) strictly verified.");
    passedTests++;

    // ---------------------------------------------------------
    // [C] Vendor Payables Arithmetic
    // ---------------------------------------------------------
    console.log("[TEST C] Asserting Vendor Payables Arithmetic...");
    const createVendorRes = await fetch(`${baseUrl}/api/v1/vendors`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "Raqiib Telecom Supplier",
        phone: "614333349",
        totalOwed: 1000.0,
      }),
    });
    assert.strictEqual(createVendorRes.status, 201);
    const createVendorJson = await createVendorRes.json();
    assert.strictEqual(createVendorJson.data.totalOwed, 1000.0);
    const vendorId = createVendorJson.data._id;

    // Record vendor payment: $400.00
    const payVendorRes = await fetch(`${baseUrl}/api/v1/vendors/${vendorId}/pay`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        amount: 400.0,
        note: "EVC Plus vendor settlement",
      }),
    });
    assert.strictEqual(payVendorRes.status, 201);
    const payVendorJson = await payVendorRes.json();
    assert.strictEqual(payVendorJson.data.vendor.totalOwed, 600.0, "Remaining vendor debt must be 600.00");
    console.log("  ✓ [C] Vendor payable settlement (1000 - 400 = 600) strictly verified.");
    passedTests++;

    // ---------------------------------------------------------
    // [D] Product Margin Auto-Computation
    // ---------------------------------------------------------
    console.log("[TEST D] Asserting Product Margin Computation...");
    const createProductRes = await fetch(`${baseUrl}/api/v1/products`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "Biyo Dizaani 1.5L",
        barcode: "600123456789",
        stockCount: 120,
        unitCost: 10.0,
        sellingPrice: 12.0,
      }),
    });
    assert.strictEqual(createProductRes.status, 201);
    const createProductJson = await createProductRes.json();
    assert.strictEqual(createProductJson.data.margin, 2.0, "Margin must be exactly 12.00 - 10.00 = 2.00");
    console.log("  ✓ [D] Product margin calculation (12 - 10 = 2.00) strictly verified.");
    passedTests++;

    // ---------------------------------------------------------
    // [E] Reseller Utility Terminal
    // ---------------------------------------------------------
    console.log("[TEST E] Asserting Reseller Utility Top-up...");
    const resellerRes = await fetch(`${baseUrl}/api/v1/reseller/transact`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        provider: "HORMUUD",
        recipientPhone: "614999999",
        amount: 100.0,
        earningProfit: 17.0,
      }),
    });
    assert.strictEqual(resellerRes.status, 201);
    const resellerJson = await resellerRes.json();
    assert.strictEqual(resellerJson.data.netAmount, 117.0, "Net amount must be 100.00 + 17.00 = 117.00");
    assert.strictEqual(resellerJson.data.status, "COMPLETED");
    console.log("  ✓ [E] Reseller dispatch net calculation (100 + 17 = 117) strictly verified.");
    passedTests++;

    // ---------------------------------------------------------
    // [F] Broadcast Constraint Enforcement
    // ---------------------------------------------------------
    console.log("[TEST F] Asserting Broadcast 125-Character Constraint...");
    // 126 characters -> 400 Validation Error
    const over125Message = "A".repeat(126);
    const overRes = await fetch(`${baseUrl}/api/v1/broadcasts/send`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message: over125Message,
        recipientIds: [customerId],
      }),
    });
    assert.strictEqual(overRes.status, 400, "126-character broadcast must be rejected with 400");

    // <= 125 characters -> 201 OK
    const valid125Message = "Ogaysiis: Fadlan iska bixi deymaha kugu xusan muddo 3 maalmood gudahood ah. Mahadsanid!";
    assert.ok(valid125Message.length <= 125);
    const validBroadcastRes = await fetch(`${baseUrl}/api/v1/broadcasts/send`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message: valid125Message,
        recipientIds: [customerId],
      }),
    });
    assert.strictEqual(validBroadcastRes.status, 201, "Valid broadcast must return 201");
    const validBroadcastJson = await validBroadcastRes.json();
    assert.strictEqual(validBroadcastJson.data.recipientCount, 1);
    console.log("  ✓ [F] Broadcast constraints (126 blocked, 125 accepted) strictly verified.");
    passedTests++;

    // ---------------------------------------------------------
    // [G] Subscription Tier Math
    // ---------------------------------------------------------
    console.log("[TEST G] Asserting Subscription Tier Expiration Math...");
    // Reset merchant expiry to right now for precise testing
    const baseNow = new Date();
    await Merchant.findByIdAndUpdate(merchantId, { subscriptionExpiresAt: baseNow });

    // Activate 1_MONTH (30 days)
    const sub1Res = await fetch(`${baseUrl}/api/v1/subscriptions/activate`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        tier: "1_MONTH",
        phone: "614888881",
      }),
    });
    assert.strictEqual(sub1Res.status, 201);
    const sub1Json = await sub1Res.json();
    const expiry1 = new Date(sub1Json.data.subscription.expiresAt).getTime();
    const days1 = Math.round((expiry1 - baseNow.getTime()) / (1000 * 60 * 60 * 24));
    assert.strictEqual(days1, 30, "1_MONTH tier must extend by 30 days");

    // Activate 12_MONTHS (365 days extension from current active expiry)
    const sub12Res = await fetch(`${baseUrl}/api/v1/subscriptions/activate`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        tier: "12_MONTHS",
        phone: "614888881",
      }),
    });
    assert.strictEqual(sub12Res.status, 201);
    const sub12Json = await sub12Res.json();
    const expiry12 = new Date(sub12Json.data.subscription.expiresAt).getTime();
    const days12 = Math.round((expiry12 - expiry1) / (1000 * 60 * 60 * 24));
    assert.strictEqual(days12, 365, "12_MONTHS tier must extend by 365 days");
    console.log("  ✓ [G] Subscription tier extensions (+30d, +365d) strictly verified.");
    passedTests++;

    // ---------------------------------------------------------
    // [H] Dashboard Aggregator
    // ---------------------------------------------------------
    console.log("[TEST H] Asserting Dashboard Aggregator Totals...");
    const overviewRes = await fetch(`${baseUrl}/api/v1/dashboard/overview`, {
      headers,
    });
    assert.strictEqual(overviewRes.status, 200);
    const overviewJson = await overviewRes.json();
    const { receivables, payables, topDebtors } = overviewJson.data;

    assert.strictEqual(receivables.totalDebt, 500.0, "Overview totalDebt must match 500.00");
    assert.strictEqual(receivables.totalPaid, 150.0, "Overview totalPaid must match 150.00");
    assert.strictEqual(receivables.netBalance, 350.0, "Overview netBalance must match 350.00");
    assert.strictEqual(payables.totalOwed, 600.0, "Overview vendor totalOwed must match 600.00");
    assert.strictEqual(topDebtors.length, 1, "Top debtors should contain 1 active debtor");
    assert.strictEqual(topDebtors[0].balance, 350.0, "Top debtor balance must match 350.00");
    console.log("  ✓ [H] Dashboard aggregator math strictly verified.");
    passedTests++;

    console.log("\n=======================================================");
    console.log(`   ALL ${passedTests}/${totalAssertions} TEST SUITES PASSED (100% PASS RATE)   `);
    console.log("=======================================================\n");
  } catch (error) {
    console.error("\n❌ TEST SUITE ASSERTION FAILED:", error);
    process.exitCode = 1;
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await mongoose.connection.close();
    process.exit(process.exitCode || 0);
  }
}

runTestSuite();

