"""
No application backend.

This project has NO custom backend: all data/auth is handled directly from
Next.js via @supabase/supabase-js against Supabase Postgres. FastAPI was removed.
This is a minimal pure-ASGI callable (no web framework) that only exists so the
supervisor-managed `uvicorn server:app` process stays alive in the preview pod.
"""


async def app(scope, receive, send):
    if scope["type"] == "lifespan":
        while True:
            message = await receive()
            if message["type"] == "lifespan.startup":
                await send({"type": "lifespan.startup.complete"})
            elif message["type"] == "lifespan.shutdown":
                await send({"type": "lifespan.shutdown.complete"})
                return
        return

    if scope["type"] == "http":
        await send(
            {
                "type": "http.response.start",
                "status": 200,
                "headers": [(b"content-type", b"application/json")],
            }
        )
        await send(
            {
                "type": "http.response.body",
                "body": b'{"status":"ok","backend":"none - data layer is Supabase"}',
            }
        )
