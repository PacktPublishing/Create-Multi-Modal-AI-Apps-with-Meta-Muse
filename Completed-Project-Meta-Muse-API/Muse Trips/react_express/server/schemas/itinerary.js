export const ITINERARY_SCHEMA = {
  type: 'object',
  properties: {
    destination: { type: 'string' },
    days: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          day: { type: 'integer' },
          title: { type: 'string' },
          activities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                time: { type: 'string', enum: ['Morning', 'Afternoon', 'Evening'] },
                name: { type: 'string' },
                description: { type: 'string' },
              },
              required: ['time', 'name', 'description'],
              additionalProperties: false,
            },
          },
        },
        required: ['day', 'title', 'activities'],
        additionalProperties: false,
      },
    },
  },
  required: ['destination', 'days'],
  additionalProperties: false,
};
