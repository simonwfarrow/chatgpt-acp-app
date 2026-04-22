#!/usr/bin/env node
import { readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const customerId = process.argv[2];

if (!customerId) {
    console.error("Usage: node scripts/set-customer.mjs <customer-id>");
    process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));

// Derive available customers from the filesystem so new profiles are auto-recognised.
const availableCustomers = readdirSync(resolve(__dirname, "../customers")).filter(
    (name) => !name.startsWith("."),
);

if (!availableCustomers.includes(customerId)) {
    console.error(`Unknown customer: "${customerId}"`);
    console.error(`Available customers: ${availableCustomers.join(", ")}`);
    process.exit(1);
}

const customerFilePath = resolve(__dirname, "../src/customer.ts");

const content = [
    "// Change this import to switch the active customer profile.",
    `export { config as activeConfig } from "../customers/${customerId}/config";`,
    "",
].join("\n");

writeFileSync(customerFilePath, content, "utf8");

console.log(`✅ Active customer set to: ${customerId}`);
