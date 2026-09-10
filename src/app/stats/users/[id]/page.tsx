import { UserStatsDetail } from '@/components/stats/UserStatsDetail';

export default async function UserStatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserStatsDetail userId={id} />;
}
