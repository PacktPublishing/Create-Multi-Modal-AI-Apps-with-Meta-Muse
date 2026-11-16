import { Router } from 'express';
import { client, MODEL } from '../muse.js';
import { friendlyError } from '../errors.js';
import { INSPIRATION_SCHEMA } from '../schemas/inspiration.js';

const PROMPT =
  'Describe the vibe of this place in a few words, ' +
  'then suggest 3 real destinations that match it.';

const router = Router();

router.post('/', async (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'image is required' });
  }

  try {
    const response = await client.responses.create({
      model: MODEL,
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: PROMPT },
            { type: 'input_image', image_url: image },
          ],
        },
      ],
      reasoning: { effort: 'minimal' },
      text: {
        format: {
          type: 'json_schema',
          name: 'inspiration',
          schema: INSPIRATION_SCHEMA,
          strict: true,
        },
      },
    });
    res.json(JSON.parse(response.output_text));
  } catch (err) {
    res.status(500).json({ error: friendlyError(err, 'Could not read the photo') });
  }
});

export default router;
