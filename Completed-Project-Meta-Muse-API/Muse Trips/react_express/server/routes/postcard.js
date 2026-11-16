import { Router } from 'express';
import { client } from '../muse.js';
import { friendlyError } from '../errors.js';

const router = Router();

router.post('/', async (req, res) => {
  const { destination, highlights } = req.body;
  if (!destination) {
    return res.status(400).json({ error: 'destination is required' });
  }

  const prompt =
    `A vintage travel postcard of ${destination}, showing ${highlights}. ` +
    `Bold retro illustration with the words "Greetings from ${destination}".`;

  try {
    const result = await client.images.generate({
      model: 'muse-image-1.0',
      prompt,
      size: '1536x1024',
      output_format: 'jpeg',
    });
    const base64 = result.data[0].b64_json;
    res.json({ image: `data:image/jpeg;base64,${base64}` });
  } catch (err) {
    res.status(500).json({ error: friendlyError(err, 'Could not create the postcard') });
  }
});

export default router;
