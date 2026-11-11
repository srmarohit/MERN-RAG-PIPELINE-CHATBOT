import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ question: string; answer: string }[]>([]);
  const [question, setQuestion] = useState('Tell me about my insurance policy')
  const [answer, setAnswer] = useState('This is a sample answer from the insurance assistant. the assistant will provide relevant answers based on the context of your policy and the information available in our database.');

  const handleAskQuestion = async () => {
    setLoading(true);
          setAnswer(''); // Clear the answer field to show loading state
    try {
      const response = await fetch('http://localhost:8080/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response from server:', data);

      if(data?.content){
        setAnswer(data.content);
      } else {
        setAnswer('Sorry, I could not find an answer to your question.');
      }
    } catch (error) {
      console.error('Error asking question:', error);
      setAnswer('Sorry, there was an error processing your request.');
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
    if (answer) {
      setHistory((prevHistory) => [...prevHistory, { question, answer }]);
      setQuestion(''); // Clear the question input after adding to history
      setAnswer(''); // Clear the answer field after adding to history
    }
  }, [answer]);

  return (
   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Welcome to the Insurance Assistant</h1>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px', height: '650px', width: '600px', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        
         <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 4, width: '100%' }}>
          {
            history.map((item, index) => (
              <div key={index} style={{ marginBottom: '10px', padding: '10px', borderRadius: '5px', backgroundColor: index % 2 === 0 ? '#e0f7fa' : '#f1f8e9' }}>
                <strong>Q:</strong> {item.question}<br />
                <strong>A:</strong> {item.answer}
              </div>
            ))
          }
         </div>
         <div style={{ flex: 1, position: 'relative', width: '100%', backgroundColor: '#e0e0e0', borderRadius: '5px', display: 'flex', alignItems: 'center', padding: '10px' }}>
           <input 
            style={{ width: '100%', height: '100%', fontSize: '16px', padding: '7px', borderRadius: '5px', border: '1px solid #ccc' }}
            value={question} 
            onChange={(e) => setQuestion(e.target.value)}
           type="text" placeholder="Ask a question about your insurance policy..." />
            <button 
              style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', 
              
              backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '5px', cursor: 'pointer',
              fontSize: '16px' }}
              onClick={handleAskQuestion}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Ask'}
            </button>
         </div>
      </div>

       <div className="chat-container">

    <div className="chat-body" id="chatBody">
      <div className="suggestions" id="suggestions">

        <div>
          <div className="bubble-list">
            <button className="bubble" onClick={() => setQuestion("What is the coverage amount for Amit Verma’s health policy?")}>What is the coverage amount for Amit Verma’s health policy?</button>
            <button className="bubble" onClick={() => setQuestion("When does Neha Kapoor’s policy expire?")}>When does Neha Kapoor’s policy expire?</button>
          </div>
        </div>

        <div>
          <div className="bubble-list">
            <button className="bubble" onClick={() => setQuestion("Tell me about any customer who had an accident-related claim.")}>Tell me about any customer who had an accident-related claim.</button>
          </div>
        </div>

        <div>
          <div className="bubble-list">
            <button className="bubble" onClick={() => setQuestion("Hey, can you check if anyone has recently claimed for surgery?")}>Hey, can you check if anyone has recently claimed for surgery?</button>
            <button className="bubble" onClick={() => setQuestion("Who are our oldest and youngest policyholders?")}>Who are our oldest and youngest policyholders?</button>
            <button className="bubble" onClick={() => setQuestion("Which insurance plan provides the maximum coverage with the lowest premium?")}>Which insurance plan provides the maximum coverage with the lowest premium?</button>
          </div>
        </div>

      </div>
    </div>
   </div>
   </div>
  )
}

export default App
