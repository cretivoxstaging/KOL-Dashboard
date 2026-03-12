/**
 * ============================================
 * SPK TEMPLATE GENERATOR
 * ============================================
 *
 * Fungsi generateHTML untuk menghasilkan dokumen SPK
 * dalam format HTML yang siap di-render di iframe.
 *
 * Based on backend EJS template - converted to React template literals
 */

export const generateHTML = (spkData: any): string => {
  // ========== HELPER FUNCTIONS ==========

  // Format number to Indonesian currency (without "Rp" prefix)
  const formatCurrency = (num: string | number) => {
    const numValue =
      typeof num === "string" ? parseInt(num.replace(/\D/g, "")) : num;
    return new Intl.NumberFormat("id-ID").format(numValue || 0);
  };

  // Format date string to Indonesian format
  const formatDateToIndonesian = (dateStr: string, type: 'month' | 'full' = 'month'): string => {
    if (!dateStr || dateStr.trim() === "") return "";

    const bulanIndonesia = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    try {
      if (type === "month") {
        // Format: YYYY-MM => "Januari 2026"
        const parts = dateStr.split("-");
        if (parts.length >= 2) {
          const bulan = parseInt(parts[1]);
          const tahun = parts[0];
          if (bulan >= 1 && bulan <= 12) {
            return `${bulanIndonesia[bulan - 1]} ${tahun}`;
          }
        }
      } else if (type === "full") {
        // Format: YYYY-MM-DD => "27 Januari 2026" atau YYYY-MM-DD HH:MM => "27 Januari 2026"
        const cleanDate = dateStr.split(" ")[0]; // Remove time part if exists
        const parts = cleanDate.split("-");
        if (parts.length >= 3) {
          const hari = parseInt(parts[2]);
          const bulan = parseInt(parts[1]);
          const tahun = parts[0];
          if (bulan >= 1 && bulan <= 12 && hari >= 1 && hari <= 31) {
            return `${hari} ${bulanIndonesia[bulan - 1]} ${tahun}`;
          }
        }
      }
    } catch (e) {
      // Fallback jika parsing error
    }

    return "";
  };

  // Format date string for display (fallback)
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "[Tanggal]";
    // Try to format first
    const formatted = formatDateToIndonesian(dateStr, "full");
    return formatted || dateStr;
  };

  // Build campaign period string
  const campaignPeriod = (() => {
    const start = spkData.campaign_start || "";
    const end = spkData.campaign_end || "";

    const startFormatted = formatDateToIndonesian(start, "month");
    const endFormatted = formatDateToIndonesian(end, "month");

    if (startFormatted && endFormatted) {
      return startFormatted === endFormatted ? startFormatted : `${startFormatted} - ${endFormatted}`;
    }
    if (startFormatted) return startFormatted;
    if (endFormatted) return endFormatted;
    return "[Periode Kampanye]";
  })();

  // ========== BUILD SOW TABLE (rowsHtml) ==========

  const sowRowsData: any[] = [];

  // Collect all SOW entries
  for (let i = 1; i <= 10; i++) {
    const sow = spkData[`sow${i}`];
    const jumlah = spkData[`jumlah${i}`];
    const ket1 = spkData[`keterangan${i}_1`] || "";
    const ket2 = spkData[`keterangan${i}_2`] || "";
    const ket3 = spkData[`keterangan${i}_3`] || "";

    if (sow && String(sow).trim() !== "") {
      // Build keterangan with IDs for horizontal scroll targeting (index-specific)
      const keteranganParts: string[] = [];
      if (ket1 && String(ket1).trim() !== "") {
        keteranganParts.push(`<div id="sow-${i}-col-1">${ket1}</div>`);
      }
      if (ket2 && String(ket2).trim() !== "") {
        keteranganParts.push(`<div id="sow-${i}-col-2">${ket2}</div>`);
      }
      if (ket3 && String(ket3).trim() !== "") {
        keteranganParts.push(`<div id="sow-${i}-col-3">${ket3}</div>`);
      }
      const keterangan = keteranganParts.length > 0 ? keteranganParts.join("") : "-";

      sowRowsData.push({
        index: i,
        sow: sow,
        jumlah: jumlah || "-",
        keterangan: keterangan || "-",
      });
    }
  }

  // Build Talents List from array structure
  const talentsList: string[] = [];
  if (spkData.talents && Array.isArray(spkData.talents)) {
    talentsList.push(
      ...spkData.talents
        .filter((t: any) => t.name && String(t.name).trim() !== "")
        .map((t: any) => String(t.name))
    );
  } else {
    // Fallback: support old structure for backward compatibility
    for (let i = 1; i <= 5; i++) {
      const talentName = spkData[`talent_name${i}`];
      if (talentName && String(talentName).trim() !== "") {
        talentsList.push(String(talentName));
      }
    }
  }

  // Generate SOW table HTML with Talent names
  let rowsHtml = "";
  if (sowRowsData.length === 0) {
    // No SOW data
    rowsHtml = `
      <tr>
        <td style="border: 1pt solid black; padding: 8px; text-align: center;" colspan="4">
          <em style="color: #999;">Belum ada SOW yang ditambahkan</em>
        </td>
      </tr>
    `;
  } else {
    sowRowsData.forEach((row, idx) => {
      // For first row, show talent names (or all talents if only one SOW)
      // For subsequent rows, leave talent cell empty or repeat
      const talentDisplay =
        idx === 0
          ? talentsList.length > 0
            ? talentsList.join("<br/>")
            : "[Nama Talent]"
          : "&nbsp;";

      rowsHtml += `
        <tr>
          <td id="sow-${row.index}-talent" style="border: 1pt solid black; padding: 8px; vertical-align: top;">${talentDisplay}</td>
          <td id="sow-${row.index}-col-desc" style="border: 1pt solid black; padding: 8px; vertical-align: top;">${row.sow}</td>
          <td id="sow-${row.index}-col-qty" style="border: 1pt solid black; padding: 8px; text-align: center; vertical-align: top;">${row.jumlah}</td>
          <td style="border: 1pt solid black; padding: 8px; vertical-align: top;">${row.keterangan}</td>
        </tr>
      `;
    });
  }

  // ========== CALCULATE kewajibanRowspan ==========
  // Base rows: 1 (intro text) + 1 (table header) + sowRowsData.length (SOW rows)
  const kewajibanRowspan = 2 + Math.max(sowRowsData.length, 1);

  // ========== BUILD COMPETITORS LIST ==========

  const competitorsList: Array<{index: number, id: string, name: string}> = [];
  if (spkData.competitors && Array.isArray(spkData.competitors)) {
    // New array structure with IDs
    spkData.competitors.forEach((comp: any, idx: number) => {
      if (comp.name && String(comp.name).trim() !== "") {
        competitorsList.push({
          index: idx + 1,
          id: comp.id,
          name: String(comp.name)
        });
      }
    });
  } else {
    // Fallback: support old structure for backward compatibility
    for (let i = 1; i <= 10; i++) {
      const comp = spkData[`competitor${i}`];
      if (comp && String(comp).trim() !== "") {
        competitorsList.push({
          index: i,
          id: `competitor-${i}`,
          name: String(comp)
        });
      }
    }
  }

  const competitorListHtml =
    competitorsList.length > 0
      ? competitorsList.map((c, i) => `<span id="competitor-${c.id}">${i + 1}. ${c.name}</span>`).join("<br/>")
      : "Produk sejenis";

  // ========== BUILD CONDITIONAL SECTIONS ==========

  // Vendor identity rows (dynamic numbering)
  const vendorIdentityRows = (() => {
    let no = 1;
    let rows = "";

    if (
      spkData.vendor_company_name &&
      String(spkData.vendor_company_name).trim() !== ""
    ) {
      rows += `
        <tr>
          <td class="label-cell">${no++}.</td>
          <td class="field-name">Nama Perusahaan:</td>
          <td id="preview-vendor-company-name" class="background-yellow">${spkData.vendor_company_name}</td>
        </tr>
      `;
    }

    rows += `
      <tr>
        <td class="label-cell">${no++}.</td>
        <td class="field-name">Nama Penandatangan:</td>
        <td id="preview-vendor-name" class="background-yellow">${spkData.vendor_name || "[Nama Vendor]"}</td>
      </tr>
      <tr>
        <td class="label-cell">${no++}.</td>
        <td class="field-name">NIK:</td>
        <td id="preview-vendor-nik" class="background-yellow">${spkData.vendor_nik || "[NIK]"}</td>
      </tr>
      <tr>
        <td class="label-cell">${no++}.</td>
        <td class="field-name">Alamat KTP:</td>
        <td id="preview-vendor-address" class="background-yellow">${spkData.vendor_address || "[Alamat]"}</td>
      </tr>
      <tr>
        <td class="label-cell">${no++}.</td>
        <td class="field-name">Bertindak Sebagai:</td>
        <td id="preview-vendor-role" class="background-yellow">${spkData.vendor_role || "[Peran]"}</td>
      </tr>
    `;

    return rows;
  })();

  // Collab nature text (Eksklusif vs Non-Eksklusif)
  const collabNatureText = (() => {
    const competitorText =
      competitorsList.length > 0
        ? competitorsList.map(c => c.name).join(", ")
        : "Produk sejenis";

    if (String(spkData.collab_nature).trim() === "Eksklusif") {
      return `
        <b>Eksklusif.</b> Selama Jangka Waktu Kampanye Pemasaran, <b>Talent dilarang</b> untuk bekerja sama, mempromosikan, mengeluarkan komentar positif dan/atau terlihat di muka publik menggunakan <b>produk pesaing Merek</b> (Kompetitor: ${competitorText}) pada jenis perusahaan yang sama. Dan/atau mengeluarkan komentar positif terhadap barang alternatif atau pengganti dari Merek.
      `;
    }

    return `
      <b>Non-Eksklusif.</b> Selama Jangka Waktu Kampanye Pemasaran, <b>Talent berhak</b> untuk bekerja sama dengan pihak ketiga manapun. Perjanjian ini tidak membatasi kebebasan Talent untuk mengulas, memberikan penilaian, dan/atau menyatakan pendapatnya atas produk apa pun.
    `;
  })();

  // Additional sections after SOW table (dynamic numbering)
  const additionalSections = (() => {
    let no = 7;
    let sections = "";

    // 7. Ketentuan Pemasaran Konten (always present)
    sections += `
      <tr>
        <td class="label-cell" style="vertical-align: top; padding-top: 8px">${no++}.</td>
        <td class="field-name" style="vertical-align: top; padding-top: 8px">
          Ketentuan Pemasaran Konten:
        </td>
        <td colspan="4" style="padding: 8px; text-align: justify">
          Pihak Pertama akan selalu menjaga etika dan moral serta tidak
          menonjolkan hal-hal yang menurut etika, moral, suku dan agama dapat
          berakibat negatif dan mempengaruhi pendapat orang lain.
          <strong>
            Apabila terdapat "skandal" yang dilakukan oleh Pihak Kedua, Pihak
            Pertama berhak mempertimbangkan pemutusan kerja sama dan hanya
            membayarkan pekerjaan yang sudah selesai.
          </strong>
          ${
            String(spkData.collab_nature).trim() !== "Non Eksklusif"
              ? `
            <br /><br />
            Selama masa berlakunya perjanjian ini, Pihak Kedua tidak diperkenankan
            melakukan kerjasama atau mempromosikan, dalam bentuk apapun, baik
            berbayar maupun tidak berbayar, dengan pihak lain yang merupakan
            kompetitor langsung atau berasal dari industri yang sama dengan
            <strong>${spkData.brand_name || "[Brand]"}</strong>, tanpa persetujuan tertulis dari
            Pihak Pertama.
          `
              : ""
          }
        </td>
      </tr>
    `;

    // 8. Kompetitor (only if Eksklusif)
    if (String(spkData.collab_nature).trim() === "Eksklusif") {
      sections += `
        <tr>
          <td class="label-cell" style="vertical-align: top; padding-top: 8px">${no++}.</td>
          <td class="field-name" style="vertical-align: top; padding-top: 8px" id="section-competitors">
            Kompetitor:
          </td>
          <td colspan="4" style="padding: 8px; text-align: justify">
            Pihak Kedua tidak diperbolehkan bekerja sama secara Eksklusif dan/atau Non Eksklusif
            dengan kompetitor Merek, dengan detail Merek:
            <br /><br />
            ${competitorListHtml}
          </td>
        </tr>
      `;
    }

    // Imbalan (always present)
    sections += `
      <tr>
        <td class="label-cell" style="border-top:1.7pt solid black;">${no++}.</td>
        <td class="field-name" style="border-top:1.7pt solid black;">Imbalan Pihak Kedua:</td>
        <td colspan="4" style="padding:12px 16px; border-top:1.7pt solid black;">
          <div style="display:flex; gap:12px;">
            <span style="width:120px;">Project Fee</span>
            <span id="preview-project-fee">: Rp${formatCurrency(spkData.project_fee || 0)}</span>
          </div>

          <div style="display:flex; gap:12px; margin-top:4px;">
            <span style="width:120px;">PPh 23 (2%)</span>
            <span id="preview-pph-23">: Rp${formatCurrency(spkData.pph_23 || 0)}</span>
          </div>

          <div style="margin:6px 0 8px 132px; font-family: monospace;">
            ________________________________
          </div>

          <div style="display:flex; gap:12px;">
            <span style="width:120px;">Grand Total</span>
            <span id="preview-grand-total">: Rp${formatCurrency(spkData.grand_total || 0)}</span>
          </div>

          <div style="margin-top:6px;font-size:11px;">
            *yang akan dibayarkan Pihak Pertama yang akan dipotong PPh 23 senilai 2%
          </div>
        </td>
      </tr>
    `;

    // Pembayaran ditujukan kepada (always present)
    sections += `
      <tr>
        <td class="label-cell" style="vertical-align: top; padding-top: 8px">${no++}.</td>
        <td class="field-name" style="vertical-align: top; padding-top: 8px">Pembayaran ditujukan kepada:</td>
        <td colspan="4" style="padding: 0;">
          <table style="width: 100%; border-collapse: collapse; border: none;">
            <tr>
              <td style="border: none; padding: 4px 4px 4px 8px; width: 120px;">Nama Bank</td>
              <td id="preview-bank-name" style="border: none; padding: 4px;">: ${spkData.bank_name || "[Nama Bank]"}</td>
            </tr>
            <tr>
              <td style="border: none; padding: 4px 4px 4px 8px;">Cabang</td>
              <td id="preview-bank-branch" style="border: none; padding: 4px;">: ${spkData.bank_branch || "[Cabang]"}</td>
            </tr>
            <tr>
              <td style="border: none; padding: 4px 4px 4px 8px;">No. Rekening</td>
              <td id="preview-bank-account-number" style="border: none; padding: 4px;">: ${spkData.bank_account_number || "[No. Rekening]"}</td>
            </tr>
            <tr>
              <td style="border: none; padding: 4px 4px 8px 8px;">Nama Akun</td>
              <td id="preview-bank-account-name" style="border: none; padding: 4px;">: ${spkData.bank_account_name || "[Nama Pemilik]"}</td>
            </tr>
          </table>
        </td>
      </tr>
    `;

    // Ketentuan Pembayaran (always present)
    sections += `
      <tr>
        <td class="label-cell" style="vertical-align: top; padding-top: 8px">${no++}.</td>
        <td class="field-name" style="vertical-align: top; padding-top: 8px">Ketentuan Pembayaran:</td>
        <td colspan="4" style="padding: 8px; text-align: justify">
          Pembayaran <strong>secara penuh, yakni Rp ${formatCurrency(spkData.grand_total || 0)}</strong>
          (${spkData.grand_total_words || "[Terbilang]"} rupiah)
          yang dibayarkan maksimal pada tanggal <span id="preview-payment-date">${formatDateToIndonesian(spkData.payment_date, "full") || "[Tanggal]"}</span>.
        </td>
      </tr>
    `;

    return sections;
  })();

  // Spacer for Non-Eksklusif layout
  const nonEksklusifSpacer =
    String(spkData.collab_nature).trim() === "Non Eksklusif"
      ? '<div style="height: 120px;"></div>'
      : "";

  // Vendor company name in signature
  const vendorCompanySignature =
    spkData.vendor_company_name &&
    String(spkData.vendor_company_name).trim() !== ""
      ? `<div style="font-weight: bold;">${spkData.vendor_company_name}</div>`
      : '<div style="font-weight: bold;">&nbsp;</div>';

  // ========== RETURN FULL HTML ==========

  return `
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <style>
      @page {
        size: A4;
        margin: 2.5cm 1.5cm 1.5cm 1.5cm;
      }

      body {
        font-family: "arial", sans-serif;
        font-size: 8pt;
        color: #000;
        line-height: 1.2;
        margin: 0;
        padding: 0;
        overflow-x: auto;
        min-width: 210mm;
        width: 100%;
      }

      .header-logo {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .header-logo img {
        height: 70px;
      }
      .header-logo .url {
        font-size: 8pt;
        font-weight: bold;
        margin-top: 20px;
      }

      .header-logo-fixed {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 1.5cm 2cm 0 2cm;
        height: 70px;
        background-color: white;
        z-index: 9999;
      }

      @media print {
        body {
          margin: 0;
          padding: 0;
        }

        thead {
          display: table-header-group;
        }
        tfoot {
          display: table-footer-group;
        }

        .print-header {
          margin-bottom: 20px;
          height: 60px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          border-bottom: 1px solid #000;
          z-index: 1000;
        }

        .header-space {
          height: 60px;
        }

        .content {
          margin-top: 0px;
        }

        tr {
          page-break-inside: avoid;
        }
      }

      .print-header img {
        height: 50px;
      }

      .print-header span {
        font-size: 8pt;
        font-weight: bold;
      }

      .header-space {
        height: 60px;
      }

      .title-section {
        text-align: center;
        margin-bottom: 25px;
      }
      .title-section h1 {
        font-size: 13pt;
        text-decoration: underline;
        margin: 0;
        font-weight: bold;
        text-transform: uppercase;
      }
      .title-section p {
        margin: 2px 0;
        font-weight: bold;
      }
      .opening-text {
        text-align: justify;
        margin-bottom: 15px;
      }

      table.word-table {
        width: 100%;
        min-width: 210mm;
        border-collapse: collapse;
        margin-bottom: 5px;
      }
      table.word-table th,
      table.word-table td {
        border: 1pt solid #000 !important;
        padding: 4px 8px;
        vertical-align: top;
        text-align: left;
      }

      .section-header {
        background-color: white;
        font-weight: bold;
        padding: 8px 16px !important;
      }
      .label-cell {
        width: 40px;
        text-align: center;
      }
      .field-name {
        width: 180px;
        font-weight: bold;
      }
      .footer-label {
        margin-bottom: 15px;
        font-size: 10pt;
      }
      .dynamic-val {
        background-color: transparent;
      }

      .page-break {
        break-before: page;
      }

      /* SOW column IDs for horizontal scroll precision - matches sow-{index}-col-{type} pattern */
      [id^="sow-"][id*="-col-"],
      [id^="sow-"][id$="-talent"] {
        padding: 8px 12px !important;
      }

      /* Live Highlight untuk active section */
      .active-highlight {
        background-color: #fef08a !important;
        transition: background-color 0.3s ease;
      }

      .active-highlight-start {
        scroll-margin-left: 24px;
      }
    </style>
  </head>

  <body>
    <table style="width: 100%; border-collapse: collapse; border: none;">
      <thead>
        <tr>
          <td style="border: none; padding-bottom: 16px;">
            <div class="header-logo" style="margin-bottom: 20px;">
              <img src="https://ik.imagekit.io/df125g9cz/Logo%20CRETIVOX/Cretivox%20Logo%20BLACK.png" height="50px" />
              <span class="url">www.cretivox.com</span>
            </div>
          </td>
        </tr>
      </thead>
      <tbody>
        <!-- PAGE 1 -->
        <tr>
          <td style="border: none;">
            <div class="content">

              <div class="title-section">
                <h1>SURAT PERJANJIAN KERJASAMA</h1>
                <p>${spkData.spk_number || "[Nomor SPK]"}</p>
              </div>

              <div class="opening-text">
                Surat Perjanjian Kerjasama Jasa ("<strong>SPK</strong>") ini dibuat di
                Jakarta, pada tanggal
                <strong>${spkData.created_at || formatDateToIndonesian(spkData.payment_date, "full") || "[Tanggal]"}</strong> oleh dan antara
                <strong>PT. SUARA KREATIF MUDA</strong>, sebuah perusahaan yang
                berkedudukan di Gedung OBE lt.3 Lois Jeans, Jl. Balap Sepeda No.6B, Rawamangun, Gadung, Kec. Pulo, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13220 untuk selanjutnya disebut "<strong>Pihak Pertama</strong>"; dengan pihak sebagai berikut:
              </div>

              <table class="word-table">
                <tr class="section-header" id="section-company">
                  <td colspan="3">Bagian I: Identitas Perusahaan</td>
                </tr>
                <tr>
                  <td class="label-cell">1.</td>
                  <td class="field-name">Nama Perusahaan:</td>
                  <td>PT. SUARA KREATIF MUDA</td>
                </tr>
                <tr>
                  <td class="label-cell">2.</td>
                  <td class="field-name">Alamat:</td>
                  <td>
                    Gedung OBE lt.3 Lois Jeans, Jl. Balap Sepeda No.6B, Rawamangun, Gadung, Kec. Pulo, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13220
                  </td>
                </tr>
                <tr>
                  <td class="label-cell">3.</td>
                  <td class="field-name">Nama Penandatangan:</td>
                  <td id="preview-first-party-signer" class="background-yellow">${spkData.first_party_signer || "[Nama Penandatangan]"}</td>
                </tr>
                <tr>
                  <td class="label-cell">4.</td>
                  <td class="field-name">Jabatan Penandatangan:</td>
                  <td id="preview-first-party-position" class="background-yellow">${spkData.first_party_position || "[Jabatan]"}</td>
                </tr>
                <tr class="section-header">
                  <td colspan="3">
                    Selanjutnya disebut "<strong>Pihak Pertama</strong>"
                  </td>
                </tr>
              </table>

              <table class="word-table" style="margin-top: 30px">
                <tr class="section-header" id="section-vendor">
                  <td colspan="3">Bagian II: Identitas Vendor</td>
                </tr>
                ${vendorIdentityRows}
                <tr class="section-header">
                  <td colspan="3">Selanjutnya disebut "<strong>Pihak Kedua</strong>"</td>
                </tr>
              </table>

              <div class="opening-text" style="margin-top: 20px">
                Pihak Pertama dan Pihak Kedua dengan ini menyepakati untuk bekerjasama
                dalam suatu perjanjian jasa dengan objek yang diperjanjikan, sebagai
                berikut:
              </div>

            </div>
          </td>
        </tr>

        <tr>
          <td style="border: none; padding: 0;"></td>
        </tr>

        <tr>
          <td style="border: none; padding: 0;">
            <div class="content">
              <table class="word-table">
                <tr class="section-header" id="section-commercial">
                  <td colspan="3">Bagian III: Ketentuan Komersial</td>
                </tr>
                <tr>
                  <td class="label-cell">1.</td>
                  <td class="field-name">Merek yang dipromosikan:</td>
                  <td id="preview-brand-name" class="background-yellow">${spkData.brand_name || "[Nama Brand]"}</td>
                </tr>
                <tr>
                  <td class="label-cell">2.</td>
                  <td class="field-name">Jenis Perusahaan:</td>
                  <td id="preview-business-type" class="background-yellow">${spkData.business_type || "[Jenis Bisnis]"}</td>
                </tr>
                <tr>
                  <td class="label-cell">3.</td>
                  <td class="field-name">Jenis Kerjasama:</td>
                  <td id="preview-jenis-kerjasama" class="background-yellow">${spkData.collab_type || "[Jenis Kolaborasi]"}</td>
                </tr>
                <tr>
                  <td class="label-cell">4.</td>
                  <td class="field-name">Jangka Waktu Kampanye Pemasaran:</td>
                  <td id="preview-campaign-period" class="background-yellow">${campaignPeriod}</td>
                </tr>
                <tr>
                  <td class="label-cell">5.</td>
                  <td class="field-name">Sifat Kerjasama:</td>
                  <td id="preview-collab-nature" class="background-yellow">
                    ${collabNatureText}
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>

        <!-- PAGE 2 -->
        <tr>
          <td style="border: none; padding: 0;">
            <div class="content">
              <table class="word-table">

                <!-- SOW Header -->
                <tr>
                  <td rowspan="${kewajibanRowspan}" class="label-cell" style="vertical-align: top; padding-top: 8px">
                    6.
                  </td>
                  <td rowspan="${kewajibanRowspan}"
                    class="field-name"
                    style="width: 180px; vertical-align: top; padding-top: 8px"
                    id="section-sow"
                  >
                    <span class="background-yellow">Kewajiban Pihak Kedua:</span>
                  </td>

                  <td colspan="4" style="padding: 0;">
                    <div style="padding: 8px">
                      Pihak Kedua wajib melaksanakan dan memenuhi pekerjaan sebagai berikut:
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="border: 1pt solid black; width: 25%; padding: 4px; text-align: center; font-weight: bold;">
                    Nama ("Talent")
                  </td>
                  <td style="border: 1pt solid black; width: 35%; padding: 4px; text-align: center; font-weight: bold;">
                    SOW
                  </td>
                  <td style="border: 1pt solid black; width: 15%; padding: 4px; text-align: center; font-weight: bold;">
                    Jumlah
                  </td>
                  <td style="border: 1pt solid black; width: 25%; padding: 4px; text-align: center; font-weight: bold;">
                    Keterangan
                  </td>
                </tr>

                ${rowsHtml}

                ${additionalSections}
              </table>
              ${nonEksklusifSpacer}
              <div class="opening-text" style="margin-top: 20px; font-size: 8pt;">
                Seluruh pelaksanaan penyediaan jasa sebagaimana diatur pada Perjanjian ini berdasarkan pada Syarat dan Ketentuan Umum dalam Pasal yang tertera pada Perjanjian ini.
                Demikian perjanjian ini dibuat dan ditandatangani oleh wakil yang sah dari masing-masing Pihak Penandatangan dan/atau transmisi secara elektronik serta tanda tangan elektronik atas Perjanjian ini oleh wakil yang sah dan berwenang dari masing-masing Pihak dengan ini disepakati dianggap sebagai tanda tangan asli, dan tanda tangan yang dipindai (scanned) dan/atau elektronik tersebut memiliki kekuatan umum yang sama dengan tanda tangan asli.
              </div>
              <div style="height: 10px;"></div>
              <div style="text-align: center; font-weight: bold; margin-top: 30px; margin-bottom: 30px; font-size: 10pt;">
                Menyepakati:
              </div>

              <table style="width: 100%; border-collapse: collapse; border: none;">
                <tr>
                  <td style="width: 50%; border: none; text-align: center; vertical-align: top;">
                    <div style="font-weight: bold; margin-bottom: 2px;">PIHAK PERTAMA</div>
                    <div style="font-weight: bold;">PT. SUARA KREATIF MUDA</div>
                    <div style="height: 80px;"></div>
                    <div style="font-weight: bold; text-decoration: underline;">${spkData.first_party_signer || "[Nama Penandatangan]"}</div>
                    <div style="font-size: 8pt;">${spkData.first_party_position || "[Jabatan]"}</div>
                  </td>
                  <td style="width: 50%; border: none; text-align: center; vertical-align: top;">
                    <div style="font-weight: bold; margin-bottom: 2px;">PIHAK KEDUA</div>
                    ${vendorCompanySignature}
                    <div style="height: 80px;"></div>
                    <div style="font-weight: bold; text-decoration: underline;">${spkData.vendor_name || "[Nama Vendor]"}</div>
                    <div style="font-size: 8pt;">${spkData.vendor_role || "[Peran]"}</div>
                  </td>
                </tr>
              </table>

            </div>
          </td>
        </tr>

      </tbody>
    </table>
    <script>
      (function() {
        var activeSection = '${spkData.activeSection || ''}';
        
        // Hapus semua highlight sebelumnya
        var allHighlighted = document.querySelectorAll('.active-highlight');
        for (var i = 0; i < allHighlighted.length; i++) {
          allHighlighted[i].classList.remove('active-highlight');
          allHighlighted[i].classList.remove('active-highlight-start');
        }
        
        if (activeSection) {
          if (window.requestAnimationFrame) {
            requestAnimationFrame(function() {
              // Try specific ID first
              var element = document.getElementById(activeSection);
              
              // Fallback: if specific SOW column ID not found, try section-sow
              if (!element && activeSection.indexOf('sow-') !== -1) {
                element = document.getElementById('section-sow');
              }
              
              if (element) {
                // Add highlight class
                element.classList.add('active-highlight');
                var normalizedSection = String(activeSection).toLowerCase();

                // Strict center only for table-like sections (SOW/description/keterangan)
                var shouldCenter =
                  normalizedSection.indexOf('sow') !== -1 ||
                  normalizedSection.indexOf('description') !== -1 ||
                  normalizedSection.indexOf('keterangan') !== -1;

                // Start for identity/single-line fields, with left padding offset
                if (!shouldCenter) {
                  element.classList.add('active-highlight-start');
                }

                var inlineAlignment = shouldCenter
                  ? 'center' 
                  : 'start';
                
                element.scrollIntoView({ 
                  behavior: 'auto', 
                  block: 'center', 
                  inline: inlineAlignment 
                });
              }
            });
          } else {
            setTimeout(function() {
              // Try specific ID first
              var element = document.getElementById(activeSection);
              
              // Fallback: if specific SOW column ID not found, try section-sow
              if (!element && activeSection.indexOf('sow-') !== -1) {
                element = document.getElementById('section-sow');
              }
              
              if (element) {
                // Add highlight class
                element.classList.add('active-highlight');
                var normalizedSection = String(activeSection).toLowerCase();

                // Strict center only for table-like sections (SOW/description/keterangan)
                var shouldCenter =
                  normalizedSection.indexOf('sow') !== -1 ||
                  normalizedSection.indexOf('description') !== -1 ||
                  normalizedSection.indexOf('keterangan') !== -1;

                // Start for identity/single-line fields, with left padding offset
                if (!shouldCenter) {
                  element.classList.add('active-highlight-start');
                }

                var inlineAlignment = shouldCenter
                  ? 'center' 
                  : 'start';
                
                element.scrollIntoView({ 
                  behavior: 'auto', 
                  block: 'center', 
                  inline: inlineAlignment 
                });
              }
            }, 0);
          }
        }
      })();
    </script>
    
    <script>
      // Send document height to parent for dynamic sizing
      (function() {
        function sendHeight() {
          var height = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
          );
          
          window.parent.postMessage({
            type: 'spk-iframe-height',
            height: height
          }, '*');
        }
        
        // Send height on load
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', sendHeight);
        } else {
          sendHeight();
        }
        
        // Resend on window load (images, etc)
        window.addEventListener('load', sendHeight);
        
        // Also send periodically in case content changes
        setTimeout(sendHeight, 100);
        setTimeout(sendHeight, 500);
        setTimeout(sendHeight, 1000);
      })();
    </script>
  </body>
</html>
  `;
};
