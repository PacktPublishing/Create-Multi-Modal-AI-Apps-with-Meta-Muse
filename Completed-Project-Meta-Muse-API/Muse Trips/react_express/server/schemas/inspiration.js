export const INSPIRATION_SCHEMA = {
  type: 'object',
  properties: {
    vibe: { type: 'string' },
    destinations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          country: { type: 'string' },
          why: { type: 'string' },
        },
        required: ['name', 'country', 'why'],
        additionalProperties: false,
      },
    },
  },
  required: ['vibe', 'destinations'],
  additionalProperties: false,
};
