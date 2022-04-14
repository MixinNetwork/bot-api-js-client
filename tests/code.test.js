import Code from '../src/code';

describe('Tests for code', () => {
  const code = new Code();

  test('Test for read code', () => {
    code.Show('cf4bdff1-b476-46a3-a17c-535ccba45b69').then((resp) => {
      const result = resp.data.data;
      expect(result.creator_id).toMatch('e9e5b807-fa8b-455a-8dfa-b189d28310ff');
    });
  });
});
