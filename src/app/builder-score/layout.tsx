import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Builder Score Methodology | ListingBooth',
  description: 'Understand how ListingBooth calculates the proprietary 100-point Builder Score using HCRA regulatory data, Tarion claims, and financial standing.',
};

export default function BuilderScoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
