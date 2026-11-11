import "dotenv/config"
import axios from 'axios';
export async function getEmbeddings(data: string | string[]) {
    const apiKey = process.env.HUGGING_FACE_API_KEY;
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        data: {
            inputs: data  // ✅ pass raw string or array of strings here
        }
    };
    // 
    try {
        const response = await axios.request(config);
        console.log('response->', response.data);
        return response.data;
    } catch (err: any) {
        console.error('HuggingFace API error:', err.response?.data || err.message);
    }
}


// getEmbeddings("I love sci fi movies.")