/**
 * Local dev launcher. Some Windows/corporate setups cannot verify Supabase TLS
 * in Node (UNABLE_TO_VERIFY_LEAF_SIGNATURE), which breaks proxy auth and SSR.
 * This only affects `npm run dev`, not production builds.
 */
if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === undefined) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

import { spawn } from "node:child_process";

const nextArgs = ["dev", ...process.argv.slice(2)];
const child = spawn("npx", ["next", ...nextArgs], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
