/**
 * Homepage (server). The v2 body is the client component HomeV2; this wrapper exists so the
 * admin-managed «home-mid» ad (dashboard/reklamlar → AdSlot, a server component) can be rendered
 * between the news/market area and the ecosystem orbit. AdSlot returns null without an active ad.
 * @task TASK-0516
 */
import AdSlot from '@/components/ads/AdSlot';
import HomeV2 from '@/components/home/v2/HomeV2';
import styles from '@/components/home/v2/homeV2.module.css';

export default function Home() {
  return <HomeV2 adSlot={<AdSlot placement="home-mid" wrapperClassName={styles.homeAd} />} />;
}
