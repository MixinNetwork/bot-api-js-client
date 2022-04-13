import Transfer from '../src/transfer';
import keystore from './keystore';

describe('Tests for conversation', () => {
  const transfer = new Transfer(keystore);
  const traceId = 'cf823ea5-c102-4e5d-8a95-d1350b3100ca';

  test('Test for create outputs', () => {
    const body = [
      { receivers: [keystore.user_id], index: 1 },
    ];
    transfer.Output(body).then((resp) => {
      const result = resp.data.data;
      expect(result.length).toEqual(1);
    });
  });

  test('Test for create payment', () => {
    const body = {
      asset_id: '965e5c6e-434c-3fa9-b780-c50f43cd955c',
      opponent_multisig: {
        receivers: ['7a522ae4-841b-357b-a7b1-4f5f51488b8f', 'e9e5b807-fa8b-455a-8dfa-b189d28310ff'],
        threshold: 1,
      },
      amount: '0.01',
      trace_id: 'ae21ca2a-061f-40ed-8f9b-b032eaa923b1',
    };
    transfer.Payment(body).then((resp) => {
      const result = resp.data.data;
      expect(result.asset_id).toMatch('965e5c6e-434c-3fa9-b780-c50f43cd955c');
    });
  });

  test('Test for transfer', () => {
    const body = {
      asset_id: '965e5c6e-434c-3fa9-b780-c50f43cd955c',
      amount: '0.01',
      opponent_id: 'e9e5b807-fa8b-455a-8dfa-b189d28310ff',
      trace_id: traceId,
      memo: '',
    };
    transfer.Transfer(body).then((resp) => {
      const result = resp.data.data;
      expect(result.trace_id).toMatch(traceId);
    });
  });

  test('Test for trace transaction', () => {
    transfer.Trace(traceId).then((resp) => {
      const result = resp.data.data;
      expect(result.trace_id).toMatch(traceId);
    });
  });
});
