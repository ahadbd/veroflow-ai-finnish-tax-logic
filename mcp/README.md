# Firebase MCP Server

This repo now includes a minimal MCP server that connects to Firebase through the Admin SDK.

## What it does

- Reads Firestore through Firebase Admin credentials.
- Exposes tools for project config, listing collections, reading a document, and querying a collection.
- Loads local env values from `.env.local` first, then `.env`.
- Starts even without Firebase Admin credentials, but Firestore tools require a service account.

## Required env vars

Set these in `.env.local` for the MCP server:

- `FIREBASE_SERVICE_ACCOUNT_PATH` or `FIREBASE_SERVICE_ACCOUNT_JSON`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_DATABASE_ID`

The web app still uses the `NEXT_PUBLIC_FIREBASE_*` variables for browser auth.
The MCP server needs Firebase Admin access for Firestore reads.

## Run

```bash
npm run mcp:firebase
```

## MCP tools

- `firebase_get_project_config`
- `firebase_list_collections`
- `firebase_get_document`
- `firebase_query_collection`

## Example client config

Point your MCP client at:

```json
{
  "mcpServers": {
    "veroflow-firebase": {
      "command": "node",
      "args": ["mcp/firebase-mcp-server.mjs"],
      "cwd": "d:/Vibe coding/veroflow ai"
    }
  }
}
```