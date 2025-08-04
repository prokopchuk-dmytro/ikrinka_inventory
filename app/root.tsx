import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { AppProvider } from "@shopify/app-bridge-react";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request }: { request: Request }) {
  const { shop, host } = new URL(request.url).searchParams;
  return { apiKey: process.env.SHOPIFY_API_KEY, host };
}

export default function Root() {
  const { apiKey, host } = useLoaderData<typeof loader>();

  return (
    <html lang="uk">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <AppProvider config={{ apiKey, host, forceRedirect: true }}>
          <Outlet />
        </AppProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}