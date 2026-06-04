import type { NextConfig } from "next";

// Windows/corporate AV often breaks Node TLS to Supabase (UNABLE_TO_VERIFY_LEAF_SIGNATURE).
// Browser login works; proxy getUser() fails without this in local dev only.
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED ??= "0";
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
