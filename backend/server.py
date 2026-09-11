"""
Placeholder backend.

This project deliberately has NO custom application backend: all data access is
done directly from Next.js via @supabase/supabase-js against Supabase Postgres.
This tiny FastAPI app exists only so the supervisor-managed `backend` process
stays healthy in the preview environment. It contains no business logic.
"""
from fastapi import FastAPI

app = FastAPI(title="erp-financeiro (no-op backend)")


@app.get("/api/health")
def health():
    return {"status": "ok", "note": "data layer is Supabase; no app backend"}
