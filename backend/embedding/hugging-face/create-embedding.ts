const { getDB, getCollection, closeConn } = require("./db");
const { getEmbeddings } = require("./getHuggingFaceEmbedding");

const collection = 'sample_movies_v1';

async function updateMoviewDataWithEmbeddings() {
    try {
        const moviesColl = await getCollection(collection);
        const cursor = moviesColl.find({
            Plot: { $exists: true }
        });
        for await (const doc of cursor) {
            const inputText = `${doc.Plot} ${doc.Genre} ${doc.Title} ${doc.Actors}`
            const embedding = await getEmbeddings(inputText);
            doc['plot_embedding'] = embedding;
            const result = await moviesColl.updateOne(
                { _id: doc._id },               // Filter
                { $set: doc },                  // Update operation
                { upsert: true }                // Upsert option
            );
            console.log('result->', result);
        }
        console.log('Documents updated successfully.');
    } catch (err) {
        console.error(err);
    } finally {
        await closeConn();
    }
}

updateMoviewDataWithEmbeddings();

