import { discoveryPipelineGenerator } from '@/app/actions/youtube';

export const runtime = 'nodejs'; 
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * SSE DISCOVERY ENDPOINT
 * Streams probabilistic retrieval events in real-time.
 */
export async function POST(req: Request) {
  try {
    const { query, count, blacklistHashes } = await req.json();

    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid query payload.' }), { status: 400 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const send = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // Pass blacklist hashes to prevent cross-session repeats
          const generator = discoveryPipelineGenerator(query, count, blacklistHashes || []);
          for await (const event of generator) {
            send(event);
          }
        } catch (e: any) {
          send({ type: 'error', message: `Pipeline Fault: ${e.message}` });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Discovery Handshake Failed.' }), { status: 500 });
  }
}
