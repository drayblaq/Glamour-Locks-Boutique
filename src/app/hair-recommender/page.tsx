// This file ensures that if the /hair-recommender path is accessed,
// it correctly shows a "Not Found" page, as the feature was removed.
import { notFound } from 'next/navigation';

export default function HairRecommenderPage() {
  notFound();
  // This return is technically unreachable due to notFound() throwing an error,
  return null;
}
