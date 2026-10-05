import type { Metadata } from 'next';
import Book from '../../src/site/components/Book';
import FeeRouter from '../../src/site/components/FeeRouter';
import { LATEST_EDITION } from '../../src/site/editions';

export const metadata: Metadata = {
  title: 'Fee router',
  description:
    'Every $VERA creator fee lands in a contract nobody controls: 50% burned at each freeze, 30% to the verification vault, 20% to data.',
};

export default function FeeRouterPage() {
  return (
    <Book contents={[{ href: '#token-title', label: 'Token and window' }, { href: '#split-title', label: 'The split' }, { href: '#balances-title', label: 'Balances and guards' }, { href: '#ledgers-title', label: 'Burns and bounties' }, { href: '#run-title', label: 'Run it yourself' }]} edition={LATEST_EDITION.edition}>
      <FeeRouter editionId={LATEST_EDITION.edition} />
    </Book>
  );
}
