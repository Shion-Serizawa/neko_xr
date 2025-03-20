import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// MIMEタイプのマッピング
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".gltf": "model/gltf+json",
  ".glb": "model/gltf-binary",
};

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  let path = url.pathname;
  
  // ルートパスの場合はindex.htmlを提供
  if (path === "/" || path === "") {
    path = "/index.html";
  }

  // パスからファイル拡張子を取得
  const extension = path.substring(path.lastIndexOf("."));
  const contentType = MIME_TYPES[extension] || "application/octet-stream";

  try {
    // ファイルパスを正規化（セキュリティのため）
    const normalizedPath = path.replace(/^\/+/, "");
    
    // ファイルを読み込む
    const file = await Deno.readFile(normalizedPath);
    
    return new Response(file, {
      status: 200,
      headers: {
        "content-type": contentType,
      },
    });
  } catch (error) {
    console.error(`Error serving ${path}:`, error);
    
    if (error instanceof Deno.errors.NotFound) {
      return new Response(`File not found: ${path}`, { status: 404 });
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(`Internal server error: ${errorMessage}`, { status: 500 });
  }
}

// サーバーを起動
const port = 8000;
console.log(`HTTPサーバーを起動しています。http://localhost:${port}/`);
await serve(handler, { port });