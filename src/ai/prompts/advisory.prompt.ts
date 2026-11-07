// src/ai/prompts/advisory.prompt.ts
//
// Prompt templates for operational DSS advisory.
// Guides the LLM to act as a senior SME operations consultant (Konsultan Operasional UMKM).

import type { CapacityEngineResult } from "@/engine/types";
const QUESTION_FOCUS: Record<string, string> = {
  general: "Berikan ringkasan kondisi dan saran tindakan yang paling penting.",
  why_risk: "Jelaskan MENGAPA pesanan ini berstatus demikian, sebutkan penyebab utama dari angka engine dengan bahasa sederhana.",
  bottleneck: "Jelaskan bottleneck mana yang paling membatasi dan mengapa, urutkan dari yang paling berat.",
  how_fix: "Berikan 2-3 langkah paling murah dan realistis agar pesanan ini layak, urut dari yang termurah.",
  priority: "Tentukan satu resource yang harus diprioritaskan lebih dulu dan alasannya.",
  add_worker: "Jelaskan secara kualitatif apakah menambah satu pekerja akan membantu, berdasarkan bottleneck yang ada. JANGAN menghitung angka baru; sebutkan bahwa angka pastinya dapat dicek di Simulasi What-If.",
};

export function buildAdvisoryPrompt(params: {
  productName: string;
  quantity: number;
  customerName: string;
  deliveryDateStr: string;
  analysis: CapacityEngineResult;
  question?: string;
  leadTimeWarnings?: string[];
}): string {
  const { productName, quantity, customerName, deliveryDateStr, analysis, question, leadTimeWarnings } = params;
  const leadTimeBlock =
    leadTimeWarnings && leadTimeWarnings.length > 0
      ? `\nKENDALA LEAD TIME SUPPLIER (FAKTA, JANGAN DIBANTAH):\n${leadTimeWarnings
          .map((w, i) => `${i + 1}. ${w}`)
          .join("\n")}\nJika kendala ini ada, JANGAN menjadikan "beli bahan tambahan ke supplier" sebagai solusi utama; sarankan bahan substitusi, penjadwalan ulang, atau pengiriman bertahap.\n`
      : "";
  const focus =
  question && Object.prototype.hasOwnProperty.call(QUESTION_FOCUS, question)
    ? QUESTION_FOCUS[question]
    : QUESTION_FOCUS.general;
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

LANGKAH PENALARAN ENGINE:
${analysis.reasoning.map((r, i) => `${i + 1}. ${r}`).join("\n")}
${leadTimeBlock}
FOKUS PERTANYAAN PEMILIK USAHA:
${focus}

FORMAT OUTPUT HARUS BERUPA JSON VALID dengan struktur:
{
  "headline": "Judul rekomendasi singkat dan tegas (maks 8 kata)",
  "summary": "Ringkasan analisis situasi operasional dalam 2-3 kalimat yang jelas dan solutif.",
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
