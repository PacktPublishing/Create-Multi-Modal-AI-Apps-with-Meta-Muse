import './App.css';
import ChatPanel from './components/ChatPanel.jsx';
import ItineraryPanel from './components/ItineraryPanel.jsx';

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>✈️ Muse Trips</h1>
        <p>Your AI trip planner, powered by the Meta Muse API</p>
      </header>
      <main className="layout">
        <ChatPanel />
        <ItineraryPanel />
      </main>
    </div>
  );
}
