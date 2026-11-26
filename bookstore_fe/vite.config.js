import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        rolldownOptions: {
            output: {
                codeSplitting: {
                    groups: [
                        {
                            name: "vendor-react",
                            test: /node_modules[\\/](react|react-dom|react-router-dom|scheduler)[\\/]/,
                        },
                        {
                            name: "vendor-ui",
                            test: /node_modules[\\/](lucide-react|@tanstack|axios|@vercel)[\\/]/,
                        },
                        {
                            name: "portal-admin",
                            test: /src[\\/]components[\\/]admin[\\/]/,
                        },
                        {
                            name: "portal-manager",
                            test: /src[\\/]components[\\/]manager[\\/]/,
                        },
                    ],
                },
            },
        },
    },
});
