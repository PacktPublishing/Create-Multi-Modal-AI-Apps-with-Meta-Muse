const MESSAGES = {
  401: 'The server is missing a valid Muse API key.',
  402: 'The Model API account needs billing set up.',
  404: 'That Muse model could not be found.',
  429: 'Muse is busy right now. Please try again in a moment.',
};

export function friendlyError(err, fallback = 'Something went wrong. Please try again.') {
  console.error(err.status, err.message);
  return MESSAGES[err.status] ?? fallback;
}
