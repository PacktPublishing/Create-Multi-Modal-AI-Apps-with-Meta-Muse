import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';
import itineraryRouter from './routes/itinerary.js';
import inspireRouter from './routes/inspire.js';
import postcardRouter from './routes/postcard.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/chat', chatRouter);
app.use('/api/itinerary', itineraryRouter);
app.use('/api/inspire', inspireRouter);
app.use('/api/postcard', postcardRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
