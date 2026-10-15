import { Landmark3D, CustomVocabularyEntry } from '../types/gesture';

/**
 * Extracts a normalized 63-dimensional feature vector from 21 hand landmarks.
 * 1. Translates all landmarks relative to the wrist (landmark 0).
 * 2. Normalizes by palm scale (distance from wrist to middle finger MCP #9).
 * Translation & scale invariant.
 */
export function extractNormalizedFeatures(landmarks: Landmark3D[]): number[] | null {
  if (!landmarks || landmarks.length !== 21) {
    return null;
  }

  const wrist = landmarks[0];

  // Calculate palm scale reference (distance from wrist #0 to middle MCP #9)
  const middleMcp = landmarks[9];
  const dx = middleMcp.x - wrist.x;
  const dy = middleMcp.y - wrist.y;
  const dz = (middleMcp.z ?? 0) - (wrist.z ?? 0);
  let palmScale = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Fallback scale if palmScale is degenerate
  if (palmScale < 0.01) {
    let maxDist = 0.01;
    for (let i = 1; i < landmarks.length; i++) {
      const d = Math.hypot(
        landmarks[i].x - wrist.x,
        landmarks[i].y - wrist.y,
        (landmarks[i].z ?? 0) - (wrist.z ?? 0)
      );
      if (d > maxDist) maxDist = d;
    }
    palmScale = maxDist;
  }

  const features: number[] = new Array(63);
  for (let i = 0; i < 21; i++) {
    const pt = landmarks[i];
    features[i * 3] = (pt.x - wrist.x) / palmScale;
    features[i * 3 + 1] = (pt.y - wrist.y) / palmScale;
    features[i * 3 + 2] = ((pt.z ?? 0) - (wrist.z ?? 0)) / palmScale;
  }

  return features;
}

export interface KnnNeighbor {
  entryId: string;
  distance: number;
}

export interface KnnPrediction {
  matchedEntry: CustomVocabularyEntry | null;
  confidence: number; // 0 to 1
  minDistance: number;
  averageKDistance: number;
  isReliable: boolean;
  totalTrainedEntries: number;
  totalSamples: number;
}

/**
 * Computes Euclidean distance between two feature vectors of equal length.
 */
function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Custom KNN Classifier with weighted distance voting and confidence calibration.
 */
export function classifyHandFeatures(
  features: number[],
  vocabulary: CustomVocabularyEntry[],
  k: number = 3,
  maxDistanceThreshold: number = 1.6
): KnnPrediction {
  const readyEntries = vocabulary.filter((entry) => entry.samples.length >= 3);
  let totalSamples = 0;
  readyEntries.forEach((e) => (totalSamples += e.samples.length));

  if (readyEntries.length === 0 || totalSamples === 0) {
    return {
      matchedEntry: null,
      confidence: 0,
      minDistance: 999,
      averageKDistance: 999,
      isReliable: false,
      totalTrainedEntries: readyEntries.length,
      totalSamples
    };
  }

  // Calculate distance to all samples across all entries
  const allNeighbors: KnnNeighbor[] = [];
  for (const entry of readyEntries) {
    for (const sample of entry.samples) {
      const dist = euclideanDistance(features, sample.features);
      allNeighbors.push({
        entryId: entry.id,
        distance: dist
      });
    }
  }

  // Sort by ascending distance
  allNeighbors.sort((a, b) => a.distance - b.distance);

  // Take top K neighbors
  const effectiveK = Math.min(k, allNeighbors.length);
  const kNearest = allNeighbors.slice(0, effectiveK);

  const minDistance = kNearest[0].distance;
  const avgKDist = kNearest.reduce((sum, n) => sum + n.distance, 0) / effectiveK;

  // Rejection threshold: if even closest neighbor is too far, hand pose is unknown
  if (minDistance > maxDistanceThreshold) {
    return {
      matchedEntry: null,
      confidence: 0,
      minDistance,
      averageKDistance: avgKDist,
      isReliable: false,
      totalTrainedEntries: readyEntries.length,
      totalSamples
    };
  }

  // Weighted voting by inverse distance
  const scoreMap: Record<string, number> = {};
  for (const neighbor of kNearest) {
    const weight = 1 / (neighbor.distance + 0.05);
    scoreMap[neighbor.entryId] = (scoreMap[neighbor.entryId] || 0) + weight;
  }

  let bestEntryId = '';
  let highestScore = -1;
  for (const [entryId, score] of Object.entries(scoreMap)) {
    if (score > highestScore) {
      highestScore = score;
      bestEntryId = entryId;
    }
  }

  const matchedEntry = readyEntries.find((e) => e.id === bestEntryId) || null;

  // Compute similarity confidence (1.0 = exact match, 0.0 = at threshold)
  const confidence = Math.max(0, Math.min(1, 1 - minDistance / maxDistanceThreshold));
  const isReliable = confidence >= 0.45 && minDistance <= maxDistanceThreshold;

  return {
    matchedEntry,
    confidence,
    minDistance,
    averageKDistance: avgKDist,
    isReliable,
    totalTrainedEntries: readyEntries.length,
    totalSamples
  };
}
