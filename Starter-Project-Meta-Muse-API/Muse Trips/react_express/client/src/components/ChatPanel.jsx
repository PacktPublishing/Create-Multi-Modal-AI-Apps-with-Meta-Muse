export default function ChatPanel() {
  return (
    <section className="panel chat">
      <h2>Travel assistant</h2>
      <div className="messages">
        <p className="empty">Tell me about the trip you want to take.</p>
      </div>
      <form className="composer">
        <input placeholder="e.g. 5 days in Lisbon in June" />
        <button type="submit">Send</button>
      </form>
    </section>
  );
}
