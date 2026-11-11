import "dotenv/config"; // must be first: its side effect runs before the imports below

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

export async function embeddingQuery(question: string) {
  // Implementation for generating embeddings
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question,
      dimensions: 512,
    });

    const embedding = response.data[0].embedding;

    return embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Failed to generate embedding");
  }
}

export async function buildAggragationPipeline(queryEmbedding: number[]) {
  // Implementation for building aggregation pipeline

  return [
    {
      $vectorSearch: {
        queryVector: queryEmbedding,
        path: "embedding",
        numCandidates: 10,
        limit: 3,
        index: "vector_index_insurance", // ✅ Make sure this matches your Atlas index name
      },
    },
    {
      $project: {
        text: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ];
}

export async function getAnswerFromLLM(query: string, context: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that answers questions based only on the provided context.",
      },
      {
        role: "user",
        content: `Context:\n${context}\n\nQuestion: ${query}`,
      },
    ],
  });
  return completion.choices[0].message;
}
