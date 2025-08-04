import { Shopify } from "@shopify/shopify-api";
import { createRemixShopify } from "@shopify/remix-app-server";

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY!,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET!,
  SCOPES: ["write_orders", "write_inventory", "read_orders", "read_inventory"],
  HOST_NAME: process.env.HOST!.replace(/https?:\/\//, ""),
  API_VERSION: "2025-07",
  IS_EMBEDDED_APP: true,
});

export const { authenticate } = createRemixShopify(Shopify);