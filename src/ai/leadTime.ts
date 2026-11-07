// src/ai/leadTime.ts
//
// Pengecekan lead time supplier (AI-03). Pure function: tanpa I/O, tanpa mengubah
// kontrak engine/types.ts. Hasilnya berupa kalimat peringatan yang dikirim ke prompt
// AI dan fallback lokal sebagai FAKTA (bukan hasil karangan AI).

import type { MaterialAnalysis } from "@/engine/types";

export interface MaterialLeadTimeInfo {
  name: string;
  /** Waktu tunggu supplier, dalam hari kerja. */
  leadTimeDays: number;
}

export function findLeadTimeConflicts(params: {
  materialAnalysis: MaterialAnalysis[];
  /** Kunci: materialId */
  leadTimes: Record<string, MaterialLeadTimeInfo>;
  /** Dari hasil engine: availableWorkDays dan estimatedProductionDays. */
  availableWorkDays: number;
  estimatedProductionDays: number;
}): string[] {
  const { materialAnalysis, leadTimes, availableWorkDays, estimatedProductionDays } = params;

  // Produksi paling lambat harus mulai N hari kerja dari sekarang (estimasi -1 = tak terhitung).
  const startsInDays =
    estimatedProductionDays < 0 ? 0 : Math.max(0, availableWorkDays - estimatedProductionDays);

  return materialAnalysis.flatMap((m) => {
    const info = leadTimes[m.materialId];
    if (!info || m.gap >= 0) return [];
    if (info.leadTimeDays <= startsInDays) return [];
    const shortfall = Math.round(Math.abs(m.gap) * 100) / 100;
    return [
      `Bahan ${info.name} kurang ${shortfall}${m.unit}, tetapi lead time supplier (${info.leadTimeDays} hari kerja) melebihi batas mulai produksi (${startsInDays} hari kerja lagi).`,
    ];
  });
}
