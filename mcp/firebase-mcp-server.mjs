import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { initializeApp, cert, applicationDefault, getApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function readJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function parseServiceAccount() {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountPath) {
    return { source: 'path', value: readJsonFile(serviceAccountPath) };
  }

  if (serviceAccountJson && serviceAccountJson.trim()) {
    return { source: 'json', value: JSON.parse(serviceAccountJson) };
  }

  return null;
}

function createFirebaseApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const databaseId = process.env.FIREBASE_DATABASE_ID || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID;
  const parsedServiceAccount = parseServiceAccount();

  if (parsedServiceAccount) {
    const serviceAccount = parsedServiceAccount.value;

    return initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || projectId,
    });
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return initializeApp({
      credential: applicationDefault(),
      projectId,
    });
  }

  return null;
}

function getFirestoreClient() {
  const firebaseApp = createFirebaseApp();

  if (!firebaseApp) {
    throw new Error('Missing Firebase Admin credentials. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON in .env.local.');
  }

  const databaseId = process.env.FIREBASE_DATABASE_ID || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID;
  return databaseId ? getFirestore(firebaseApp, databaseId) : getFirestore(firebaseApp);
}

function toText(value) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(value, null, 2),
      },
    ],
  };
}

async function listTopLevelCollections() {
  const firestore = getFirestoreClient();
  const collections = await firestore.listCollections();
  return collections.map((collection) => collection.id).sort();
}

async function getDocument(documentPath) {
  if (!documentPath || typeof documentPath !== 'string') {
    throw new Error('documentPath is required');
  }

  const firestore = getFirestoreClient();
  const snapshot = await firestore.doc(documentPath).get();
  return {
    path: documentPath,
    exists: snapshot.exists,
    data: snapshot.exists ? snapshot.data() : null,
  };
}

async function queryCollection(collectionName, limit = 25, uid) {
  if (!collectionName || typeof collectionName !== 'string') {
    throw new Error('collectionName is required');
  }

  const firestore = getFirestoreClient();
  let query = firestore.collection(collectionName).limit(Math.min(Math.max(limit, 1), 100));

  if (uid) {
    query = query.where('uid', '==', uid);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    path: docSnapshot.ref.path,
    data: docSnapshot.data(),
  }));
}

const server = new Server(
  {
    name: 'veroflow-firebase-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'firebase_get_project_config',
      description: 'Return the non-secret Firebase configuration currently loaded by the MCP server.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'firebase_list_collections',
      description: 'List top-level Firestore collections in the connected Firebase project.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'firebase_get_document',
      description: 'Fetch a Firestore document by path, such as profiles/{uid}, shifts/{id}, or receipts/{id}.',
      inputSchema: {
        type: 'object',
        properties: {
          documentPath: {
            type: 'string',
            description: 'Firestore document path.',
          },
        },
        required: ['documentPath'],
      },
    },
    {
      name: 'firebase_query_collection',
      description: 'Query a Firestore collection with an optional uid filter and limit.',
      inputSchema: {
        type: 'object',
        properties: {
          collectionName: {
            type: 'string',
            description: 'Firestore collection name.',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of documents to return.',
            default: 25,
          },
          uid: {
            type: 'string',
            description: 'Optional uid filter for owner-scoped documents.',
          },
        },
        required: ['collectionName'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  switch (name) {
    case 'firebase_get_project_config': {
      return toText({
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || null,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || null,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || null,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || null,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || null,
        databaseId: process.env.FIREBASE_DATABASE_ID || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || null,
        serviceAccountConfigured: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS),
        firestoreConnected: Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS),
        envVarsNeeded: [
          'FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON',
          'FIREBASE_PROJECT_ID',
          'FIREBASE_DATABASE_ID',
        ],
      });
    }

    case 'firebase_list_collections': {
      return toText({ collections: await listTopLevelCollections() });
    }

    case 'firebase_get_document': {
      return toText(await getDocument(String(args.documentPath)));
    }

    case 'firebase_query_collection': {
      return toText(await queryCollection(String(args.collectionName), Number(args.limit ?? 25), args.uid ? String(args.uid) : undefined));
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);