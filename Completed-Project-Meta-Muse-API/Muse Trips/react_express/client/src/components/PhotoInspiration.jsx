import { useState } from 'react';

const SAMPLES = ['cliff-village', 'alpine-lake', 'sea-cave'];

async function toSmallJpeg(src) {
  const img = new Image();
  img.src = src;
  await img.decode();
  const scale = Math.min(1, 768 / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.8);
}

export default function PhotoInspiration() {
  const [ideas, setIdeas] = useState(null);
  const [loading, setLoading] = useState(false);

  async function inspire(src) {
    setLoading(true);
    setIdeas(null);
    try {
      const image = await toSmallJpeg(src);
      const res = await fetch('/api/inspire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });
      setIdeas(await res.json());
    } finally {
      setLoading(false);
    }
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (file) inspire(URL.createObjectURL(file));
  }

  return (
    <div className="inspire">
      <p className="empty">📷 Plan from a photo</p>
      <div className="samples">
        {SAMPLES.map((name) => (
          <img
            key={name}
            src={`/samples/${name}.jpg`}
            alt={name}
            className="sample"
            onClick={() => inspire(`/samples/${name}.jpg`)}
          />
        ))}
        <label className="upload">
          Upload
          <input type="file" accept="image/*" hidden onChange={handleFile} />
        </label>
      </div>
      {loading && <p className="empty">Looking at your photo…</p>}
      {ideas?.error && <p className="empty">{ideas.error}</p>}
      {ideas?.destinations && (
        <article className="day-card">
          <h3>{ideas.vibe}</h3>
          <ul>
            {ideas.destinations.map((d) => (
              <li key={d.name}>
                <strong>{d.name}, {d.country}:</strong> {d.why}
              </li>
            ))}
          </ul>
        </article>
      )}
    </div>
  );
}
