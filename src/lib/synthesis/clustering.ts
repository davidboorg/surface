import { cosineSimilarity } from './embeddings';

export interface SignalWithEmbedding {
  id: string;
  summary: string;
  themes: string[];
  embedding: number[];
  created_at: string;
}

export interface Cluster {
  id: string;
  signals: SignalWithEmbedding[];
  centroid: number[];
  themes: string[];
}

/**
 * Cluster signals using cosine similarity threshold grouping.
 *
 * Algorithm:
 * 1. Start with first signal as first cluster centroid
 * 2. For each subsequent signal:
 *    - Find most similar cluster centroid
 *    - If similarity >= threshold, add to that cluster
 *    - Otherwise, create new cluster with this signal as centroid
 * 3. After all signals assigned, recalculate centroids
 *
 * @param signals - Signals with embeddings to cluster
 * @param threshold - Similarity threshold (0.65-0.75 works well for organizational signals)
 * @returns Array of clusters
 */
export function clusterSignals(
  signals: SignalWithEmbedding[],
  threshold: number = 0.70
): Cluster[] {
  if (signals.length === 0) return [];
  if (signals.length === 1) {
    return [{
      id: crypto.randomUUID(),
      signals: [signals[0]],
      centroid: signals[0].embedding,
      themes: signals[0].themes,
    }];
  }

  const clusters: Cluster[] = [];

  for (const signal of signals) {
    let bestClusterIndex = -1;
    let bestSimilarity = -1;

    // Find most similar cluster
    for (let i = 0; i < clusters.length; i++) {
      const similarity = cosineSimilarity(signal.embedding, clusters[i].centroid);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestClusterIndex = i;
      }
    }

    // Add to existing cluster or create new one
    if (bestSimilarity >= threshold && bestClusterIndex >= 0) {
      clusters[bestClusterIndex].signals.push(signal);
      // Update centroid as average of all signal embeddings
      clusters[bestClusterIndex].centroid = calculateCentroid(
        clusters[bestClusterIndex].signals.map(s => s.embedding)
      );
      // Merge themes
      clusters[bestClusterIndex].themes = mergeThemes(
        clusters[bestClusterIndex].signals.flatMap(s => s.themes)
      );
    } else {
      clusters.push({
        id: crypto.randomUUID(),
        signals: [signal],
        centroid: signal.embedding,
        themes: signal.themes,
      });
    }
  }

  return clusters;
}

/**
 * Calculate centroid (average) of multiple embeddings.
 */
function calculateCentroid(embeddings: number[][]): number[] {
  if (embeddings.length === 0) return [];
  if (embeddings.length === 1) return embeddings[0];

  const dimensions = embeddings[0].length;
  const centroid = new Array(dimensions).fill(0);

  for (const embedding of embeddings) {
    for (let i = 0; i < dimensions; i++) {
      centroid[i] += embedding[i];
    }
  }

  for (let i = 0; i < dimensions; i++) {
    centroid[i] /= embeddings.length;
  }

  return centroid;
}

/**
 * Merge and deduplicate themes, keeping top N most frequent.
 */
function mergeThemes(themes: string[], maxThemes: number = 5): string[] {
  const counts = new Map<string, number>();

  for (const theme of themes) {
    const normalized = theme.toLowerCase().trim();
    counts.set(normalized, (counts.get(normalized) || 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxThemes)
    .map(([theme]) => theme.charAt(0).toUpperCase() + theme.slice(1));
}

/**
 * Sort clusters by signal count (most populated first) and recency.
 */
export function sortClusters(clusters: Cluster[]): Cluster[] {
  return [...clusters].sort((a, b) => {
    // Primary: signal count (descending)
    if (b.signals.length !== a.signals.length) {
      return b.signals.length - a.signals.length;
    }
    // Secondary: most recent signal (descending)
    const aLatest = Math.max(...a.signals.map(s => new Date(s.created_at).getTime()));
    const bLatest = Math.max(...b.signals.map(s => new Date(s.created_at).getTime()));
    return bLatest - aLatest;
  });
}

/**
 * Filter clusters to only include those with minimum signal count.
 * Single-signal clusters are kept but marked as "singular" strength.
 */
export function categorizeClusterStrength(
  clusters: Cluster[]
): Array<Cluster & { strength: 'strong' | 'emerging' | 'singular' }> {
  return clusters.map(cluster => ({
    ...cluster,
    strength:
      cluster.signals.length >= 4 ? 'strong' :
      cluster.signals.length >= 2 ? 'emerging' :
      'singular'
  }));
}
