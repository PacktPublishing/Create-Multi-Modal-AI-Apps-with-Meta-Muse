import { useEffect, useRef, useState } from 'react';

export default function ChatPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState(null);
  const messagesRef = useRef(null);

  useEffect(() => {
    const el = messagesRef.current;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  function appendToLast(text) {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      return [...prev.slice(0, -1), { ...last, text: last.text + text }];
    });
  }

  function addSources(sources) {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      return [...prev.slice(0, -1), { ...last, sources }];
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const history = [...messages, { role: 'user', text }];
    setMessages(history);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: '' }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let searched = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          const event = JSON.parse(line);
          if (event.type === 'delta') appendToLast(event.text);
          if (event.type === 'tool') {
            appendToLast(`\n\n🌤️ Checking the weather in ${event.city}…\n\n`);
          }
          if (event.type === 'search' && !searched) {
            searched = true;
            appendToLast('\n\n🔎 Searching the web…\n\n');
          }
          if (event.type === 'sources') addSources(event.sources);
          if (event.type === 'done') setUsage({ ...event.usage, cost: event.cost });
          if (event.type === 'error') appendToLast(`\n\n⚠️ ${event.message}`);
        }
      }
    } catch (err) {
      const reply = err.message || 'Something went wrong. Please try again.';
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel chat">
      <h2>Travel assistant</h2>
      <div className="messages" ref={messagesRef}>
        {messages.length === 0 && (
          <p className="empty">Tell me about the trip you want to take.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            {m.text}
            {m.sources && (
              <div className="sources">
                {m.sources.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
                    {s.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && messages.at(-1)?.role === 'user' && (
          <div className="message assistant typing">…</div>
        )}
      </div>
      {usage && (
        <p className="usage">
          Last reply: {usage.total_tokens} tokens
          {' · '}{usage.input_tokens_details.cached_tokens} cached
          {' · '}${usage.cost.toFixed(4)}
        </p>
      )}
      <form className="composer" onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 5 days in Lisbon in June"
        />
        <button type="submit" disabled={loading}>
          Send
        </button>
      </form>
    </section>
  );
}
