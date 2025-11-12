// Declaraciones de tipos para Deno runtime
// Este archivo permite que TypeScript reconozca las APIs de Deno

declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined
  }
  
  function serve(handler: (req: Request) => Response | Promise<Response>): void
}

