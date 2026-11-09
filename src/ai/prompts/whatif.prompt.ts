// src/ai/prompts/whatif.prompt.ts
//
// Prompt untuk menjelaskan hasil Simulasi What-If.
// Semua angka berasal dari engine; AI hanya merangkai bahasa dan membandingkan.

import type { CapacityEngineResult, FeasibilityStatus } from "@/engine/types";
import type { WhatIfSimulationResult } from "@/engine/simulation/types";
import type { WhatIfScenarioSummary } from "../types";

const STATUS_ID: Record<FeasibilityStatus, string> = {
  FEASIBLE: "Bisa Dikerjakan (FEASIBLE)",
  AT_RISK: "Masih Perlu Perhatian (AT_RISK)",
  NOT_FEASIBLE: "Belum Sanggup (NOT_FEASIBLE)",
};

function describeLevers(s: WhatIfScenarioSummary): string {
  const levers: string[] = [];
  if (s.extraWorkerDailyHours > 0)
    levers.push(
      `Tambahan kapasitas tenaga kerja total ${s.extraWorkerDailyHours} jam per hari, gabungan seluruh pekerja ` +
        "(lembur dan/atau pekerja lepas), BUKAN jam per orang",
    );  if (s.extraMachineDailyHours > 0) levers.push(`Tambahan jam mesin ${s.extraMachineDailyHours} jam per hari`);
  if (s.deadlineShiftWorkingDays > 0) levers.push(`Tenggat diundur ${s.deadlineShiftWorkingDays} hari kerja`);
  if (s.outsourcePercent > 0) levers.push(`${s.outsourcePercent}% unit dialihkan ke mitra maklon`);
  if (s.splitDelivery)
    levers.push(
      `Kirim bertahap: ${s.splitDelivery.firstWavePercent}% unit di termin 1 tepat tenggat, termin 2 menyusul ` +
        `${s.splitDelivery.secondWaveDelayWorkingDays} hari kerja kemudian`,
    );
  return levers.length > 0 ? levers.map((l, i) => `${i + 1}. ${l}`).join("\n") : "Belum ada tuas yang diaktifkan.";
}

function describeResult(r: CapacityEngineResult): string {
  const bottlenecks =
    r.bottlenecks.map((b) => `[${b.severity}] ${b.resourceType}: ${b.description}`).join("; ") ||
    "tidak ada kendala";
  return (
    `Status: ${STATUS_ID[r.status]}; hari kerja tersedia ${r.availableWorkDays}; ` +
    `estimasi produksi ${r.estimatedProductionDays} hari; buffer ${r.bufferDays} hari; ` +
    `utilisasi tenaga kerja ${r.workerAnalysis.utilizationPercent}%; ` +
    `utilisasi mesin ${r.machineAnalysis.utilizationPercent}%; kendala: ${bottlenecks}`
  );
}

export function buildWhatIfPrompt(params: {
  productName: string;
  customerName: string;
  sim: WhatIfSimulationResult;
  scenario: WhatIfScenarioSummary;
}): string {
  const { productName, customerName, sim, scenario } = params;
  const totalUnits = sim.outsourcedUnits + sim.internalUnits;

  const splitBlock = sim.splitDelivery
    ? `\nRINCIAN KIRIM BERTAHAP:\n- Termin 1 (${sim.splitDelivery.wave1Units} unit): ${describeResult(sim.splitDelivery.wave1Result)}\n- Termin 2 (kumulatif ${sim.splitDelivery.wave1Units + sim.splitDelivery.wave2Units} unit internal): ${describeResult(sim.splitDelivery.wave2Result)}\n`
    : "";

  return `
Anda adalah Konsultan Ahli Operasional & Manajemen Kapasitas UMKM Make-to-Order Indonesia untuk aplikasi BizCapacity.
Pemilik usaha baru saja mencoba skenario "What-If" pada sebuah pesanan. Tugas Anda: menjelaskan hasilnya dengan bahasa sederhana dan membantu memilih solusi.

DATA PESANAN:
- Pelanggan: ${customerName}
- Produk: ${productName}
- Jumlah total: ${totalUnits} unit (dikerjakan internal: ${sim.internalUnits} unit, dialihkan ke mitra maklon: ${sim.outsourcedUnits} unit)

TUAS SKENARIO YANG DICOBA:
${describeLevers(scenario)}

KONDISI SEBELUM SKENARIO (baseline):
${describeResult(sim.baselineResult)}

KONDISI SETELAH SKENARIO (hasil terketat jika kirim bertahap aktif):
${describeResult(sim.simulatedResult)}
${splitBlock}
PERUBAHAN (dihitung engine):
- Status membaik: ${sim.statusImproved ? "ya" : "tidak"}
- Selisih utilisasi tenaga kerja: ${sim.deltaWorkerUtilization} poin persentase
- Selisih utilisasi mesin: ${sim.deltaMachineUtilization} poin persentase
- Selisih buffer: ${sim.deltaBufferDays} hari kerja
- Kendala teratasi: ${sim.resolvedBottlenecksCount}; kendala tersisa: ${sim.unresolvedBottlenecksCount}

FORMAT OUTPUT HARUS BERUPA JSON VALID dengan struktur:
{
  "feasibilityComparison": "2-3 kalimat yang membandingkan kondisi sebelum dan sesudah skenario.",
  "recommendedTradeoff": "1-2 kalimat: kompromi terbaik antara kelayakan dan konsekuensi (risiko, ketergantungan mitra, negosiasi pelanggan).",
  "pros": ["1-4 keuntungan konkret skenario ini"],
  "cons": ["1-4 kerugian atau risiko konkret skenario ini"],
  "actionPlan": "2-4 kalimat langkah tindak lanjut yang realistis untuk pemilik UMKM."
}

PENTING:
- Jangan mengarang angka baru. Hanya gunakan angka dan persentase yang tertera di data di atas.
- Jangan menyebut nominal biaya Rupiah; biaya belum dihitung oleh engine.
- Tambahan jam kerja adalah kapasitas gabungan seluruh tim, bukan jam kerja satu orang. Jangan menyimpulkan bahwa satu pekerja bekerja sangat panjang.
- Jika status setelah skenario masih AT_RISK atau NOT_FEASIBLE, jangan menyatakan pesanan aman.
- Keluarkan HANYA JSON murni tanpa markdown wrapper.
`.trim();
}
