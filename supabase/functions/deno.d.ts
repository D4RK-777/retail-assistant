// Deno type declarations for Edge Functions

declare global {
  namespace Deno {
    export namespace env {
      export function get(key: string): string | undefined;
    }
  }
  
  // Global crypto for UUID generation
  const crypto: {
    randomUUID(): string;
  };
}

// Module declarations for external imports
declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (request: Request) => Response | Promise<Response>): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2.7.1" {
  export function createClient(url: string, key: string): any;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  export function createClient(url: string, key: string): any;
}

declare module "https://deno.land/x/xhr@0.1.0/mod.ts" {
  // XHR polyfill module
}

// Export types
export {};