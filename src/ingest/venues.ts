// Where each venue's figures come from. Every entry here was checked by hand
// on 5 October 2026:
//   - DefiLlama slugs: the protocol page names the venue and its own domain.
//   - Contracts: taken from DefiLlama's adapter source or Mobula's integration
//     docs, confirmed to hold code via the Robinhood Chain RPC, and checked on
//     Blockscout (robinhoodchain.blockscout.com/api/v2/addresses/<address>).
//     `verified` records that check. Blockscout's API sits behind Cloudflare,
//     so the monthly job may not be able to re-check it; when it can't, these
//     flags carry forward unchanged.
// A venue with no figures here keeps null metrics, shown as "not published".

import type { ContractRef } from '../types';

export interface VenueIngestConfig {
  /** DefiLlama protocol slugs, summed (Pons runs a v1 and a v2). */
  defillamaSlugs?: string[];
  /** Count only this chain's share, for multichain venues. DefiLlama's chain name. */
  defillamaChain?: string;
  /** Bitquery network name, used for volume when DefiLlama has none. */
  bitqueryNetwork?: string;
  contracts?: ContractRef[];
  /** Blockscout-compatible API for this venue's chain, if not the default. */
  explorerApi?: string;
}

const RH = 'Robinhood Chain';

export const VENUE_INGEST: Record<string, VenueIngestConfig> = {
  pons: {
    defillamaSlugs: ['pons-v1', 'pons-v2'],
    defillamaChain: RH,
    contracts: [
      { label: 'factory', address: '0xA5aAb3F0c6EeadF30Ef1D3Eb997108E976351feB', verified: true },
      { label: 'locker', address: '0x736D76699C26D0d966744cAe304C000d471f7F35', verified: true },
      { label: 'factory v2', address: '0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e', verified: true },
      { label: 'v4 hook', address: '0xE5e702641Ea86F4ae6cC3cDaeD2B886f976Be044', verified: true },
      { label: 'v2 launch router', address: '0xe33E9E479dF8802cb0866d5d05258bEc4cF62948', verified: true },
      { label: 'legacy factory', address: '0x0c37a24F5D23A486FA692d1500881d698B1F77a4', verified: false },
    ],
  },
  'long-xyz': {
    // Launches moved to an upgradeable proxy on 6 Sep 2026; the first launcher was
    // paused on 10 Sep. The proxy address is the one the Long.xyz app calls.
    contracts: [
      { label: 'factory (upgradeable proxy)', address: '0x1Eef016F22A943abC7DD11422EDeE9D235942104', verified: true },
      { label: 'factory implementation', address: '0x7B7b87fd1Fb05864cD572C7306038552286c73d9', verified: true },
      { label: 'first launcher (paused)', address: '0x22e99278308b393ea1260859b181ad7e78f5eeed', verified: true },
      { label: 'airlock', address: '0xeb7c034704ef8dcd2d32324c1545f62fb4ad0862', verified: true },
    ],
  },
  stonkfun: {
    defillamaSlugs: ['stonkfun'],
    // Solana accounts, from DefiLlama's adapter: the STONK mint, the liquidity
    // lock program and the operator account. Not EVM contracts; no source check.
    contracts: [
      { label: 'STONK token', address: '6GmAFSYs4gk3FDao5FzzySQpPZaWsa4rUJHacpMpUNgx', verified: false },
      { label: 'lock program', address: 'LockrWmn6K5twhz3y9w1dQERbmgSaRkfnTeTKbpofwE', verified: false },
      { label: 'operator', address: '5CEbueQnq1Ym2uSSx2xXds3jQAqT1BDnkA59RZobSPAG', verified: false },
    ],
  },
  'pools-trade': {
    defillamaSlugs: ['pools'],
    defillamaChain: RH,
    contracts: [
      { label: 'token factory', address: '0x000000e200088d55c39a11f609e5f667729ad49b', verified: true },
      { label: 'v4 pool manager', address: '0x8366a39cc670b4001a1121b8f6a443a643e40951', verified: true },
    ],
  },
  pair: {
    defillamaSlugs: ['pair'],
    defillamaChain: RH,
    contracts: [
      { label: 'launchpad (upgradeable proxy)', address: '0x8660A7F019C7943b0b0A91B8E39AFf3b6DB6Ae62', verified: true },
      { label: 'v4 locker', address: '0xeFcF476E8870fB3eb8680f039414fdcCE6C2a117', verified: true },
    ],
  },
  bankr: {
    defillamaSlugs: ['bankr'],
    defillamaChain: RH,
    // Bankr launches through the shared Doppler contracts; these fee hooks pay its
    // fee wallet on every swap (DefiLlama's Bankr adapter).
    contracts: [
      { label: 'fee hook', address: '0x6f02324d20cc679d0e585290caa6b16bacbc0f77', verified: true },
      { label: 'fee hook (Safe share)', address: '0x9982538f41f2ae29ddb9d3d9307010052984fdbb', verified: true },
    ],
  },
  flap: {
    defillamaSlugs: ['flap-sh'],
    defillamaChain: RH,
    contracts: [{ label: 'portal (upgradeable proxy)', address: '0x26605f322f7fF986f381bB9A6e3f5DAb0bEaEb09', verified: true }],
  },
};

/** Venues still waiting on a verified data mapping. The desk lists these. */
export function unmappedVenues(ids: string[]): string[] {
  return ids.filter((id) => {
    const m = VENUE_INGEST[id];
    return !m || ((m.defillamaSlugs ?? []).length === 0 && (m.contracts ?? []).length === 0);
  });
}
