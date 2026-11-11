import "dotenv/config";   // must be first: its side effect runs before the imports below

import express from "express"
import cors from "cors"
import bodyParser from "body-parser";

import {embeddingQuery, buildAggragationPipeline, getAnswerFromLLM} from "./embedding/open-ai/index.ts"
import {generateAndStoreEmbeddings} from "./seed/seed.ts"
import {connectToMongo, getCollection} from "./db/mongo-client.ts"

connectToMongo()

const app = express()
app.use(express.json())
app.use(bodyParser.json()); // ✅ To parse JSON request bodies

app.use(cors())


app.get('/health', (req: express.Request, res: express.Response) => {
  res.status(200).send('Server is running')
})

app.post("/ask", async (req: express.Request, res: express.Response) => {
  // Handle ask endpoint logic here
  try {
    const { question } = req.body;
  if (!question) {
    return res.status(400).send('Question is required');
  }

  // embedd question 
  const embedding = await embeddingQuery(question);

  if(!embedding) {
    return res.status(500).send('Failed to generate embedding');
  }

  const pipeline = await buildAggragationPipeline(embedding);

  const collection = await getCollection('insurance_embeddings')

  if(!collection) {
    return res.status(500).send('Failed to get collection');
  }

  const results = await collection.aggregate(pipeline).toArray();

  console.log("results : ", results)

        const context = results.map((r: { text: string }) => r.text).join("\n\n");

        const answer = await getAnswerFromLLM(question, context);

        res.status(200).send(answer);
  } catch (error) {
    console.log("error in asking question ", error)
    return res.status(500).send('Error asking question');
  }

});

app.get('/seed', async (req: express.Request, res: express.Response) => {
    try {
        // await generateAndStoreEmbeddings();
        res.status(200).send('Embeddings generated and stored successfully');
    } catch (error) {
        console.log("error ", error);
        res.status(500).send('Error generating embeddings');
    }
})

app.listen(8080, () => {
  console.log('Server is running on port 8080')
})