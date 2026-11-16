import { useState } from 'react';
import PhotoInspiration from './PhotoInspiration.jsx';

export default function ItineraryPanel() {
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [postcard, setPostcard] = useState(null);
  const [painting, setPainting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trip = Object.fromEntries(new FormData(e.target));
    setLoading(true);
    setPostcard(null);

    try {
      const res = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trip),
      });
      setItinerary(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function makePostcard() {
    setPainting(true);
    try {
      const res = await fetch('/api/postcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: itinerary.destination,
          highlights: itinerary.days.map((d) => d.title).join(', '),
        }),
      });
      const data = await res.json();
      setPostcard(data.image);
    } finally {
      setPainting(false);
    }
  }

  return (
    <section className="panel itinerary">
      <h2>Your itinerary</h2>
      <PhotoInspiration />
      <form className="trip-form" onSubmit={handleSubmit}>
        <input name="destination" placeholder="Destination" />
        <input name="days" type="number" min="1" max="7" placeholder="Days" />
        <input name="interests" placeholder="Interests" />
        <button type="submit" disabled={loading}>
          {loading ? 'Planning…' : 'Plan trip'}
        </button>
      </form>
      {itinerary?.error && <p className="empty">{itinerary.error}</p>}
      {!itinerary && (
        <p className="empty">Your day-by-day plan will appear here.</p>
      )}
      {itinerary?.days?.map((day) => (
        <article key={day.day} className="day-card">
          <h3>
            Day {day.day}: {day.title}
          </h3>
          <ul>
            {day.activities.map((a, i) => (
              <li key={i}>
                <strong>{a.time}:</strong> {a.name}. {a.description}
              </li>
            ))}
          </ul>
        </article>
      ))}
      {itinerary?.days && (
        <button className="postcard-button" onClick={makePostcard} disabled={painting}>
          {painting ? 'Painting your postcard…' : '🖼️ Make a postcard'}
        </button>
      )}
      {postcard && <img className="postcard" src={postcard} alt="Trip postcard" />}
    </section>
  );
}
