# Data and licensing

## What we publish

Each edition file under `data/editions/` is published as is, with open CORS and no key, at `/editions/<YYYY-MM>.json`. Snapshots under `data/snapshots/` are the raw inputs; the edition header carries the SHA-256 of its snapshot, so anyone can check the scores were built from that data.

## Where figures come from

| Provider | What | Terms to check before relying on it |
|---|---|---|
| DefiLlama | Fees, TVL | Free public API; attribution expected |
| Bitquery | DEX volume | Free tier limits; key required |
| Robinhood Chain explorer | Contract verification | Public API |

Each published figure lists its providers in `metrics.sourceIds`. A provider must be in `data/sources.json` or the build fails.

## Reference material

Veracity mirrors the features and methodology of Fineness (fineness.tech), which are ideas. The Fineness repository has no licence file, so none of its code, copy, data or art is used here. Veracity's scores and rationale are its own.

React Bits components (ElasticSlider, StatusMark, HoldButton) are used under the MIT + Commons Clause licence, with attribution in each file.
