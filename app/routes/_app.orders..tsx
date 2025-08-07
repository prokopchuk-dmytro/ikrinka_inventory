import { useEffect } from "react";
import { Button } from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { useParams } from "@remix-run/react";

export async function loader() {
  return null;
}

export default function OrderWriteOff() {
  const { orderId } = useParams();

  const handleWriteOff = async () => {
    try {
      const response = await authenticatedFetch(window.app)("/api/writeoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Інвентар списано та тег додано успішно!");
        window.location.reload();
      } else {
        alert("Помилка при обробці запиту");
      }
    } catch (error: any) {
      alert(`Помилка: ${error.message}`);
    }
  };

  useEffect(() => {
    const container = document.createElement("div");
    document.querySelector(".Polaris-Page__Content")?.prepend(container);

    const { createRoot } = require("react-dom/client");
    const root = createRoot(container);
    root.render(
      <Button onClick={handleWriteOff} primary>
        Списати інвентар
      </Button>
    );

    return () => {
      root.unmount();
      container.remove();
    };
  }, []);

  return null;
}