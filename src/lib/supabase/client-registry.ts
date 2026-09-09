/**
 * client-registry.ts
 *
 * Module-scope singleton slot shared between the two client construction
 * paths — the synchronous Proxy in client.ts and the async getSupabaseClient()
 * in client-lazy.ts — so at most ONE SupabaseClient (and therefore one
 * gotrue session + one realtime connection) is ever created per page load,
 * regardless of which path touched the client first.
 *
 * This file must stay import-free: it is imported by both entry-critical
 * modules and lazy chunks, and any static dependency would defeat its purpose.
 */

type AnySupabaseClient = unknown;

let _client: AnySupabaseClient = null;

export function registerClient(client: AnySupabaseClient): void {
  _client = client;
}

export function getRegisteredClient(): AnySupabaseClient {
  return _client;
}