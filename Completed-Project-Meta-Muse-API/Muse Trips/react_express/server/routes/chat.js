import { Router } from 'express';
import { client, MODEL, costOf } from '../muse.js';
import { INSTRUCTIONS } from '../assistant.js';
import { weatherTool, getWeather } from '../tools/weather.js';
import { friendlyError } from '../errors.js';

const router = Router();

router.post('/', async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages are required' });
  }

  try {
    const input = messages.map((m) => ({ role: m.role, content: m.text }));
    res.setHeader('Content-Type', 'application/x-ndjson');

    while (true) {
      const stream = await client.responses.create({
        model: MODEL,
        instructions: INSTRUCTIONS,
        prompt_cache_key: 'muse-trips-chat',
        input,
        tools: [weatherTool, { type: 'web_search' }],
        include: ['web_search_call.results', 'reasoning.encrypted_content'],
        reasoning: { effort: 'minimal' },
        stream: true,
      });

      let calls = [];
      for await (const event of stream) {
        if (event.type === 'response.output_text.delta') {
          res.write(JSON.stringify({ type: 'delta', text: event.delta }) + '\n');
        }
        if (event.type === 'response.web_search_call.searching') {
          res.write(JSON.stringify({ type: 'search' }) + '\n');
        }
        if (event.type === 'response.completed') {
          const { output, usage } = event.response;
          calls = output.filter((item) => item.type === 'function_call');
          input.push(...output.filter((item) => item.type === 'reasoning'));
          const sources = output
            .filter((item) => item.type === 'web_search_call')
            .flatMap((item) => item.results ?? [])
            .slice(0, 3)
            .map(({ title, url }) => ({ title, url }));
          if (sources.length > 0) {
            res.write(JSON.stringify({ type: 'sources', sources }) + '\n');
          }
          if (calls.length === 0) {
            res.write(JSON.stringify({ type: 'done', usage, cost: costOf(usage) }) + '\n');
          }
        }
      }
      if (calls.length === 0) break;

      for (const call of calls) {
        const { city } = JSON.parse(call.arguments);
        res.write(JSON.stringify({ type: 'tool', city }) + '\n');
        const forecast = await getWeather(city);
        input.push(call, {
          type: 'function_call_output',
          call_id: call.call_id,
          output: JSON.stringify(forecast),
        });
      }
    }
    res.end();
  } catch (err) {
    const message = friendlyError(err);
    if (res.headersSent) {
      res.write(JSON.stringify({ type: 'error', message }) + '\n');
      return res.end();
    }
    res.status(500).json({ error: message });
  }
});

export default router;
