const test = require('blue-tape');

test('blabla', t => {
  return Promise.resolve(true).then(t.ok, t.error);
})

// process.exit(0);
