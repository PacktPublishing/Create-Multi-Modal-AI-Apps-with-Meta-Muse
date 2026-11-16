import { Router } from 'express';
import { client, MODEL } from '../muse.js';
import { friendlyError } from '../errors.js';
import { INSTRUCTIONS } from '../assistant.js';
import { ITINERARY_SCHEMA } from '../schemas/itinerary.js';

const router = Router();

router.post('/', async (req, res) => {
  const { destination, days, interests } = req.body;
  if (!destination || !days) {
    return res.status(400).json({ error: 'destination and days are required' });
  }

  try {
    const response = await client.responses.create({
      model: MODEL,
      instructions: INSTRUCTIONS,
      input: `Plan ${days} days in ${destination} for someone who loves ${interests}.`,
      reasoning: { effort: 'medium' },
      text: {
        format: {
          type: 'json_schema',
          name: 'itinerary',
          schema: ITINERARY_SCHEMA,
          strict: true,
        },
      },
    });
    res.json(JSON.parse(response.output_text));
  } catch (err) {
    res.status(500).json({ error: friendlyError(err, 'Could not plan the trip') });
  }
});

export default router;
