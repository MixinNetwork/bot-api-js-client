import Asset from '../src/asset';
import keystore from './keystore';

describe('Tests for asset', () => {
  const asset = new Asset(keystore);
  const assetBTC = 'c6d0c728-2624-429b-8e0d-d9d19b6592fa';

  test('Test for read asset', () => {
    asset.Show(assetBTC).then((resp) => {
      const result = resp.data.data;
      expect(result.asset_id).toMatch(assetBTC);
      expect(result.symbol).toMatch('BTC');
    }).catch((err) => { throw err; });
  });

  test('Test for asset list', () => {
    asset.Index().then((resp) => {
      const result = resp.data.data;
      expect(result.length).toEqual(1);
    }).catch((err) => { throw err; });
  });

  test('Test for read asset snapshots', () => {
    asset.Snapshots(assetBTC).then((resp) => {
      const result = resp.data.data;
      expect(result.length).toEqual(0);
    }).catch((err) => { throw err; });
  });
});
