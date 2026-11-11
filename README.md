# 🛡️ MERN RAG Pipeline Chatbot

A **Retrieval-Augmented Generation (RAG)** chatbot that answers natural-language questions about personalized insurance data (customers, policies, claims) stored in MongoDB. Questions are converted into vector embeddings, matched against stored data using **MongoDB Atlas Vector Search**, and the retrieved context is passed to an LLM to generate an accurate, grounded answer.

---

## ✨ Features

- Ask questions in plain English about customers, policies and claims
- Semantic search over insurance records using vector embeddings
- LLM-generated answers grounded in your own database (no guessing from general knowledge)
- Seed endpoint to generate and store embeddings for your data
- Clean chat UI with clickable suggested-question bubbles
- TypeScript backend with Express 5

---

## 🧠 How It Works

```
User question
     │
     ▼
Embed the question  ──►  vector (e.g. 384 or 1536 dimensions)
     │
     ▼
MongoDB Atlas Vector Search  ──►  top matching records (context)
     │
     ▼
LLM prompt = question + retrieved context
     │
     ▼
Answer returned to the chat UI
```

1. **Ingestion (one time):** insurance records are converted to text, embedded, and stored in the `insurance_embeddings` collection.
2. **Retrieval:** the user's question is embedded with the same model and an aggregation pipeline (`$vectorSearch`) finds the closest records.
3. **Generation:** the matched text is joined into a context block and sent to the LLM together with the question.

---

## 🧰 Tech Stack

| Layer      | Technology                                        |
| ---------- | ------------------------------------------------- |
| Frontend   | React + Vite (TypeScript)                         |
| Backend    | Node.js, Express 5, TypeScript                    |
| Database   | MongoDB (Atlas Vector Search)                     |
| Embeddings | OpenAI embeddings (swappable, see notes below)    |
| LLM        | OpenAI chat model                                 |
| Tooling    | tsx, dotenv, cors, axios                          |

---

## 📁 Project Structure

```
.
├── backend/
│   ├── server.ts                  # Express app and routes
│   ├── db/
│   │   └── mongo-client.ts        # MongoDB connection + getCollection()
│   ├── embedding/
│   │   └── open-ai/
│   │       └── index.ts           # embeddingQuery, buildAggragationPipeline, getAnswerFromLLM
│   ├── seed/
│   │   └── seed.ts                # generateAndStoreEmbeddings()
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    └── (Vite React app with the chat UI)
```

---

## ✅ Prerequisites

- Node.js **20.19+** (or 22.12+)
- A MongoDB **Atlas** cluster (vector search requires Atlas or a compatible deployment)
- An OpenAI API key

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/srmarohit/MERN-RAG-PIPELINE-CHATBOT.git
cd MERN-RAG-PIPELINE-CHATBOT
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
MONGO_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
```

> Do not wrap values in quotes or add spaces around `=`. Restart the server after changing `.env`.

Run the dev server:

```bash
npm run dev
```

The API starts on **http://localhost:8080**.

### 3. Create the vector search index

In MongoDB Atlas, create a **Vector Search** index on the `insurance_embeddings` collection. Example definition:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    }
  ]
}
```

`numDimensions` **must match** your embedding model (for example 1536 for `text-embedding-3-small`, 384 for `all-MiniLM-L6-v2`). Use the same field name and index name that your aggregation pipeline references.

### 4. Seed the embeddings

Enable the call to `generateAndStoreEmbeddings()` in the `/seed` route (it is commented out by default), then trigger it once:

```bash
curl http://localhost:8080/seed
```

### 5. Frontend setup

```bash
cd ../frontend
npm install
npm run dev
```

The UI runs on **http://localhost:5173**.

---

## 🔌 API Reference

| Method | Endpoint  | Description                                          |
| ------ | --------- | ---------------------------------------------------- |
| GET    | `/health` | Health check. Returns `Server is running`            |
| GET    | `/seed`   | Generates embeddings and stores them in MongoDB      |
| POST   | `/ask`    | Answers a question using the RAG pipeline            |

### `POST /ask`

**Request**

```json
{
  "question": "When does Neha Kapoor’s policy expire?"
}
```

**Response**: plain text answer

```
Neha Kapoor's policy expires on ...
```

**Errors**

| Status | Meaning                                         |
| ------ | ----------------------------------------------- |
| 400    | `question` is missing from the body             |
| 500    | Embedding, database or LLM failure              |

---

## 💬 Example Questions

**🧾 Direct factual questions (from data)**

- What is the coverage amount for Amit Verma’s health policy?
- How many claims has Priya Nair made so far?
- Tell me about Ramesh Patel’s latest car insurance claim.
- When does Neha Kapoor’s policy expire?

**🧠 Contextual reasoning questions**

- Tell me about any customer who had an accident-related claim.

**💬 Conversational and natural questions**

- Hey, can you check if anyone has recently claimed for surgery?
- I want to know which of our customers have vehicle insurance plans.
- Who are our oldest and youngest policyholders?
- Which insurance plan provides the maximum coverage with the lowest premium?

---

## 🛠️ Troubleshooting

| Problem | Likely cause and fix |
| ------- | -------------------- |
| Environment variables are `undefined` | ES module imports run before `dotenv.config()`. Use `import "dotenv/config"` as the **first** import, or run with `tsx watch --env-file=.env server.ts`. |
| Vector search returns no results | The index dimensions do not match the embedding model, the index is still building, or data was not seeded. |
| `/ask` returns 500 | Check the server logs, then confirm `MONGO_URI`, `OPENAI_API_KEY` and the collection name. |
| Hugging Face "insufficient permissions" or "purchase credits" errors | Use a token with Inference Providers access, or switch to free local embeddings with `@huggingface/transformers` (`Xenova/all-MiniLM-L6-v2`, 384 dimensions). |
| CORS errors in the browser | `cors()` is enabled on the backend. Confirm the frontend calls `http://localhost:8080`, or add a Vite proxy. |

---

## 🔄 Using a Free Embedding Model

To avoid paid APIs, replace the embedding function with a local model:

```bash
npm install @huggingface/transformers
```

```typescript
import { pipeline } from "@huggingface/transformers";

let extractor: any;

export async function embed(text: string): Promise<number[]> {
  extractor ??= await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  const out = await extractor(text, { pooling: "mean", normalize: true });
  return out.tolist()[0]; // 384 dimensions
}
```

Remember to re-seed your data and update `numDimensions` in the vector index whenever you change the embedding model.

---

## 🗺️ Roadmap

- [ ] Stream LLM responses to the chat UI
- [ ] Keep conversation history for follow-up questions
- [ ] Return source records alongside each answer
- [ ] Add authentication and role-based access
- [ ] Dockerize backend and frontend

---

## 📄 License

This project is licensed under the ISC License.

---

## 👤 Author

**srmarohit**
GitHub: [@srmarohit](https://github.com/srmarohit)
