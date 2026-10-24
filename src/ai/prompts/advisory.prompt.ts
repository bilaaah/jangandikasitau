// src/ai/prompts/advisory.prompt.ts
//
// Prompt templates for operational DSS advisory.
// Guides the LLM to act as a senior SME operations consultant (Konsultan Operasional UMKM).

import type { CapacityEngineResult } from "@/engine/types";

export function buildAdvisoryPrompt(params: {
  productName: string;
  quantity: number;
  customerName: string;
  deliveryDateStr: string;
  analysis: CapacityEngineResult;
}): string {
  const { productName, quantity, customerName, deliveryDateStr, analysis } = params;

  return `
Anda adalah Konsultan Ahli Operasional & Manajemen Kapasitas UMKM Make-to-Order Indonesia untuk aplikasi BizCapacity.
Tugas Anda: Menganalisis hasil kalkulasi teknis dari mesin kapasitas deterministik dan menerjemahkannya menjadi saran bisnis operasional yang praktis, cerdas, solutif, dan ramah pengguna.

DATA PESANAN:
- Pelanggan: ${customerName}
- Produk: ${productName}
- Jumlah: ${quantity} unit
- Tenggat Pengiriman: ${deliveryDateStr}

HASIL MESIN ANALISIS KAPASITAS:
- Status Kelayakan: ${analysis.status}
- Hari Kerja Tersedia: ${analysis.availableWorkDays} hari kerja
- Estimasi Hari Produksi: ${analysis.estimatedProductionDays} hari
- Buffer Hari Sisa: ${analysis.bufferDays} hari
- Utilisasi Tenaga Kerja: ${analysis.workerAnalysis.utilizationPercent}% (Butuh: ${analysis.workerAnalysis.requiredHours} jam, Bebas: ${analysis.workerAnalysis.freeHours} jam)
- Utilisasi Mesin: ${analysis.machineAnalysis.utilizationPercent}% (Butuh: ${analysis.machineAnalysis.requiredHours} jam, Bebas: ${analysis.machineAnalysis.freeHours} jam)

BOTTLENECKS (KENDALA TERDETEKSI):
${analysis.bottlenecks.map((b, i) => `${i + 1}. [${b.severity}] ${b.resourceType}: ${b.description}`).join("\n") || "Tidak ada kendala kritis."}

FORMAT OUTPUT HARUS BERUPA JSON VALID dengan struktur:
{
  "headline": "Judul rekomendasi singkat dan tegas (maks 8 kata)",
  "summary": "Ringkasan analisis situasi operasional dalam 2-3 kalimat yang jelas dan solutif.",
  "riskAssessment": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "actionItems": [
    {
      "category": "WORKFORCE" | "MACHINERY" | "MATERIAL" | "DEADLINE" | "STRATEGY",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "action": "Tindakan konkret (misal: Sewa 1 tenaga freelance packaging selama 2 hari)",
      "impact": "Dampak terhadap kapasitas (misal: Menghemat 16 jam beban kerja)"
    }
  ],
  "customerNegotiationTip": "Tips taktis untuk bernegosiasi dengan pelanggan jika terjadi risiko/tenggat ketat."
}

PENTING:
- Jangan mengarang angka kalkulasi teknis baru. Gunakan data teknis yang sudah diberikan.
- Berikan saran yang realistis untuk pemilik usaha skala UMKM.
- Keluarkan HANYA JSON murni tanpa markdown wrapper.
`.trim();
}
