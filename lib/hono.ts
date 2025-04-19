import { hc } from "hono/client";
import { AppType } from "@/app/api/[[...route]]/route";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_APP_URL: string;
    }
  }
}

if (!process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error('NEXT_PUBLIC_APP_URL environment variable is not defined');
}

export const client = hc<AppType>(process.env.NEXT_PUBLIC_APP_URL);
