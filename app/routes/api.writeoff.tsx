import { json } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

export async function action({ request }: { request: Request }) {
  try {
    const { admin } = await authenticate.admin(request);
    const { orderId } = await request.json();

    // Отримання даних замовлення
    const orderQuery = `
      query ($id: ID!) {
        order(id: $id) {
          lineItems(first: 100) {
            edges {
              node {
                variant {
                  id
                  inventoryItem {
                    id
                  }
                }
                quantity
              }
            }
          }
        }
      }
    `;

    const orderResponse = await admin.graphql(orderQuery, {
      variables: { id: `gid://shopify/Order/${orderId}` },
    });
    const orderData = await orderResponse.json();

    if (!orderData.data.order) {
      throw new Error("Order not found");
    }

    // Списання інвентарю
    const inventoryAdjustMutation = `
      mutation inventoryAdjustQuantities($inventoryAdjustments: [InventoryAdjustQuantityInput!]!) {
        inventoryAdjustQuantities(input: { adjustments: $inventoryAdjustments }) {
          inventoryAdjustments {
            item {
              id
            }
            quantityChanged
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const adjustments = orderData.data.order.lineItems.edges.map(
      (edge: any) => ({
        inventoryItemId: edge.node.variant.inventoryItem.id,
        quantityChange: -edge.node.quantity,
      })
    );

    const inventoryResponse = await admin.graphql(inventoryAdjustMutation, {
      variables: { inventoryAdjustments: adjustments },
    });
    const inventoryData = await inventoryResponse.json();

    if (inventoryData.data.inventoryAdjustQuantities.userErrors.length > 0) {
      throw new Error(
        inventoryData.data.inventoryAdjustQuantities.userErrors[0].message
      );
    }

    // Додавання тегу
    const addTagMutation = `
      mutation tagsAdd($id: ID!, $tags: [String!]!) {
        tagsAdd(id: $id, tags: $tags) {
          node {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const tagResponse = await admin.graphql(addTagMutation, {
      variables: {
        id: `gid://shopify/Order/${orderId}`,
        tags: ["WrittenOff"],
      },
    });
    const tagData = await tagResponse.json();

    if (tagData.data.tagsAdd.userErrors.length > 0) {
      throw new Error(tagData.data.tagsAdd.userErrors[0].message);
    }

    return json({ success: true });
  } catch (error: any) {
    console.error(error);
    return json({ error: error.message }, { status: 500 });
  }
}