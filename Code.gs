// ==========================================
// FILE: Code.gs
// Infranexia - FULL BACKEND API & OMNI-SYNC
// ==========================================

// ID DATABASE UTAMA ANDA
const MAIN_DB_ID = "1yNnJzi3B03gVIU96TSCvEOJRyg_3c7fYEqph53T01II"; 

const TABEL_DB = "DB_KARYAWAN";
const TABEL_CUTI = "DB_CUTI";
const TABEL_KEHADIRAN = "DB_DAILY ACTIVITY RAW"; 
const TABEL_PENSIUN = "DB_PENSIUN";
const TABEL_USULAN  = "USULAN_PENSIUN"; // Sheet sem entara sebelum ACC
const TABEL_USULAN_PROMOSI = "USULAN_PROMOSI_MUTASI";
const TABEL_MUTASI = "MUTASI";
const PENSIUN_TIMEZONE = "Asia/Jakarta";
const AUTO_USULAN_PENSIUN_HANDLER = "prosesAutoUsulanPensiunBulanan";

const EMPLOYEE_FLOW_HEADERS = [
  "no", "tahun", "bulan", "nik", "nama_karyawan", "jenis_kelamin", "nama_agama",
  "usia", "kelompok_usia", "tgl_capeg", "tgl_pegprus", "tgl_mulaikerja", "tgl_pensiun",
  "nama_employee_group", "nama_employee_subgroup", "kode_personnel_area", "kode_host",
  "kode_function_unit", "nama_function_unit", "kode_personnel_subarea", "nama_personnel_subarea",
  "tgl_psa", "kode_payroll_area", "nama_payroll_area", "kode_divisi", "tgl_divisi", "nama_divisi",
  "kode_unit", "tgl_unit", "nama_unit", "long_unit", "pt_tif", "unit 1", "unit 2", "unit 3",
  "objidposisi", "tgl_posisi", "kode_posisi", "nama_posisi", "long_posisi", "lama_posisi",
  "nama_action", "band_posisi", "tgl_band_posisi", "lama_bandposisi",
  "flag_pj", "lama_pj", "tahun_kinerja", "nilai_kinerja",
  "tahun_kompetensi", "nilai_kompetensi", "tahun_behavior", "nilai_behavior", "level_pendidikan",
  "group_pendidikan", "jurusan_pendidikan", "nama_institusi", "kode_perusahaan", "nama_perusahaan",
  "kode_home", "nama_home", "job_family", "job_function", "job_role", "role_category",
  "flag_chief", "email", "kode_gedung", "nama_gedung", "alamat_gedung", "kota_gedung",
  "CEK", "talenct_cluster"
];
const RETIREMENT_FLOW_HEADERS = ["STATUS_USULAN", "TGL_DIUSULKAN", "CATATAN", ...EMPLOYEE_FLOW_HEADERS];
const PROMOTION_FLOW_HEADERS = [
  "STATUS_USULAN", "TGL_DIUSULKAN", "POSISI_AWAL", "POSISI_USULAN", "MUTASI", "CATATAN",
  ...EMPLOYEE_FLOW_HEADERS
];

// LINK DATABASE MAGANG EXTERNAL
const URL_MAGANG = "https://docs.google.com/spreadsheets/d/1v5RSGNFQLw18PPYqyYq1c0hnMQoNsVTjSxf-ZzAIIO0/edit";
const MAGANG_EXTERNAL_ID = "1v5RSGNFQLw18PPYqyYq1c0hnMQoNsVTjSxf-ZzAIIO0"; // ID spreadsheet magang terbaru
const MAGANG_EXTERNAL_SHEET = "Form Responses 1";
const TABEL_MAGANG = "DB_MAGANG";

// Header standar DB_MAGANG — sesuai kolom form magang terbaru + kolom tambahan internal
const MAGANG_HEADERS = [
  "no", "id_magang",
  "timestamp", "nama", "nomor_hp", "email", "nim",
  "universitas", "jurusan",
  "tanggal_mulai", "tanggal_selesai", "durasi",
  "surat_pengantar", "proposal", "cv",
  "unit_tujuan", "mentor", "status",
  "surat_dinas_mentor", "keterangan_selesai", "file_sertifikat",
  "CREATED_AT", "UPDATED_AT"
];

// Mapping: header internal DB_MAGANG → header persis di sheet eksternal (Form Responses 1)
const MAGANG_EXTERNAL_MAP = {
  "timestamp"      : "Timestamp",
  "nama"           : "NAMA",
  "nomor_hp"       : "NOMOR HP",
  "email"          : "EMAIL",
  "nim"            : "NIM",
  "universitas"    : "UNIVERSITAS",
  "jurusan"        : "JURUSAN",
  "tanggal_mulai"  : "TANGGAL MASUK",
  "tanggal_selesai": "TANGGAL SELESAI",
  "durasi"         : "DURASI",
  "surat_pengantar": "SURAT PENGANTAR",
  "proposal"       : "PROPOSAL PENGANTAR",
  "cv"             : "CV/ DAFTAR RIWAYAT HIDUP"
};

// ==========================================
// HELPER FUNCTIONS (CORE SYSTEM)
// ==========================================

// Helper to normalize employee objects before copying to different flows
function _normalizeEmpObj(empObj) {
  if (!empObj) return empObj;
  empObj.nik = empObj.nik || empObj.n_nik || empObj.nomor_induk || "";
  empObj.nama_karyawan = empObj.nama_karyawan || empObj.nama || empObj.nama_lengkap || "";
  empObj.tgl_mulaikerja = empObj.tgl_mulaikerja || empObj.tgl_mulai_kerja || empObj.tanggal_masuk || "";
  empObj.tgl_pensiun = empObj.tgl_pensiun || empObj.tanggal_pensiun || "";
  empObj.talent_cluster = empObj.talenct_cluster || empObj.talent_cluster || empObj.talent || "";
  return empObj;
}

// Helper untuk selalu membuka DB berdasarkan ID
let _dbCache = null;
function getDb() {
  if (!_dbCache) {
    _dbCache = SpreadsheetApp.openById(MAIN_DB_ID);
  }
  return _dbCache;
}

// Super Helper: Membersihkan nama header dari spasi & simbol agar selalu cocok dengan sistem
function normalizeHeader(str) {
  if (!str) return "";
  return String(str).toLowerCase().trim().replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
}

function _rowToObject(normHeaders, row) {
  let obj = {};
  normHeaders.forEach((h, i) => {
    if (h) obj[h] = row[i];
  });
  return obj;
}

function _buildRowForHeaders(normHeaders, sourceObj, overrides) {
  const extraValues = overrides || {};
  return normHeaders.map(h => {
    if (extraValues[h] !== undefined) return extraValues[h];
    return sourceObj[h] !== undefined ? sourceObj[h] : "";
  });
}

function _formatTanggalUsulan(date) {
  return date.toLocaleDateString('id-ID', {
    timeZone: PENSIUN_TIMEZONE,
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

function _dateKeyInPensiunTimezone(value) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, PENSIUN_TIMEZONE, "yyyy-MM-dd");
  }

  const raw = String(value || "").trim();
  if (!raw) return "";

  const isoMatch = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:\D.*)?$/);
  if (isoMatch) {
    return `${isoMatch[1]}-${String(isoMatch[2]).padStart(2, '0')}-${String(isoMatch[3]).padStart(2, '0')}`;
  }

  const dmyMatch = raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})(?:\D.*)?$/);
  if (dmyMatch) {
    return `${dmyMatch[3]}-${String(dmyMatch[2]).padStart(2, '0')}-${String(dmyMatch[1]).padStart(2, '0')}`;
  }

  const parsedDate = new Date(raw);
  if (isNaN(parsedDate.getTime())) return "";
  return Utilities.formatDate(parsedDate, PENSIUN_TIMEZONE, "yyyy-MM-dd");
}

function _writeHeader(sheet, headers, background) {
  sheet.getRange(1, 1, 1, headers.length)
    .setValues([headers])
    .setFontWeight("bold")
    .setBackground(background)
    .setFontColor("white");
}

function _ensureSheetHeaders(ss, sheetName, headers, background) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    _writeHeader(sheet, headers, background);
    return sheet;
  }

  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) {
    _writeHeader(sheet, headers, background);
    return sheet;
  }

  const currentHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  const currentNormHeaders = currentHeaders.map(normalizeHeader);
  const nextNormHeaders = headers.map(normalizeHeader);
  const isSameLayout = currentNormHeaders.length === nextNormHeaders.length &&
    nextNormHeaders.every((h, i) => currentNormHeaders[i] === h);
  if (isSameLayout) {
    const isSameLabel = currentHeaders.every((h, i) => String(h) === headers[i]);
    if (!isSameLabel) _writeHeader(sheet, headers, background);
    return sheet;
  }

  const oldRows = lastRow > 1
    ? sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues()
    : [];
  const remappedRows = oldRows.map(row =>
    _buildRowForHeaders(nextNormHeaders, _rowToObject(currentNormHeaders, row))
  );

  sheet.clearContents();
  _writeHeader(sheet, headers, background);
  if (remappedRows.length > 0) {
    sheet.getRange(2, 1, remappedRows.length, headers.length).setValues(remappedRows);
  }
  return sheet;
}

function _assertExactSchema(sheet, expectedHeaders, sheetName) {
  const lastCol = sheet.getLastColumn();
  const currentHeaders = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  const currentNorm = currentHeaders.map(normalizeHeader);
  const expectedNorm = expectedHeaders.map(normalizeHeader);

  const sameLength = currentNorm.length === expectedNorm.length;
  const sameOrder = sameLength && expectedNorm.every((h, i) => currentNorm[i] === h);
  if (!sameOrder) {
    throw new Error(
      `Schema ${sheetName} tidak sesuai. Pastikan urutan kolom persis dengan konfigurasi sistem.`
    );
  }
}

function _assertRequiredColumns(sheet, requiredCols, sheetName) {
  const lastCol = sheet.getLastColumn();
  const headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(normalizeHeader) : [];
  const missing = requiredCols.map(normalizeHeader).filter(col => headers.indexOf(col) === -1);
  if (missing.length) {
    throw new Error(`Sheet ${sheetName} tidak memiliki kolom wajib: ${missing.join(', ')}`);
  }
}

function _readDataRowsFromRow2(sheet) {
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  if (lastRow <= 1 || lastColumn === 0) return [];
  return sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
}

function _renumberNoColumn(sheet, normHeaders) {
  const noIdx = normHeaders.indexOf("no");
  if (noIdx === -1) return;
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  const values = [];
  for (let i = 2; i <= lastRow; i++) values.push([i - 1]);
  sheet.getRange(2, noIdx + 1, values.length, 1).setValues(values);
}

function _normalizeTextKey(val) {
  return String(val || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function _normalizeNikValue(val) {
  let text = String(val == null ? "" : val).trim();
  if (!text) return "";
  text = text.replace(/\.0+$/g, ""); // Hapus desimal yang mungkin muncul dari excel
  text = text.replace(/^0+/, "");    // Abaikan leading zeros agar "0123" identik dengan "123"
  return text;
}

function _excelSerialToDate(serial) {
  const numeric = Number(serial);
  if (!isFinite(numeric)) return null;
  const millis = Math.round((numeric - 25569) * 86400 * 1000);
  const date = new Date(millis);
  return isNaN(date.getTime()) ? null : date;
}

function _normalizeActivityDateValue(value) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, PENSIUN_TIMEZONE, "yyyy-MM-dd");
  }

  if (typeof value === "number" && isFinite(value)) {
    const excelDate = _excelSerialToDate(value);
    if (excelDate) return Utilities.formatDate(excelDate, PENSIUN_TIMEZONE, "yyyy-MM-dd");
  }

  const raw = String(value || "").trim();
  if (!raw) return "";

  const ymd = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:\D.*)?$/);
  if (ymd) {
    return `${ymd[1]}-${String(ymd[2]).padStart(2, "0")}-${String(ymd[3]).padStart(2, "0")}`;
  }

  const dmy = raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})(?:\D.*)?$/);
  if (dmy) {
    const p1 = parseInt(dmy[1], 10); 
    const p2 = parseInt(dmy[2], 10); 
    let year = parseInt(dmy[3], 10);
    if (year < 100) {
      year = year <= 50 ? 2000 + year : 1900 + year;
    }
    
    let month, day;
    // Format dari Google Sheets: M/D/YYYY (Bulan/Hari/Tahun)
    // Jika p1 > 12: pasti bukan bulan → anggap D/M/YYYY
    if (p1 > 12) {
      day = p1;
      month = p2;
    } else {
      // p1 <= 12: ambil sebagai BULAN (sesuai format M/D dari Sheets)
      month = p1;
      day = p2;
    }
    
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const parsed = new Date(raw);
  if (isNaN(parsed.getTime())) return "";
  return Utilities.formatDate(parsed, PENSIUN_TIMEZONE, "yyyy-MM-dd");
}

function _getObjectValueByCandidates(obj, candidates) {
  for (let i = 0; i < candidates.length; i++) {
    const key = normalizeHeader(candidates[i]);
    if (obj[key] !== undefined && obj[key] !== null && String(obj[key]).trim() !== "") {
      return obj[key];
    }
  }
  return "";
}

function _findHeaderIndexByCandidates(normHeaders, candidates) {
  for (let i = 0; i < candidates.length; i++) {
    const idx = normHeaders.indexOf(normalizeHeader(candidates[i]));
    if (idx !== -1) return idx;
  }
  return -1;
}

function _detectHistoryTarget(empObj) {
  const probes = [
    empObj.nama_employee_group,
    empObj.nama_employee_subgroup,
    empObj.status_usulan,
    empObj.jenis_usulan,
    empObj.mutasi,
    empObj.nama_posisi,   // Cek Kolom Posisi
    empObj.nama_unit,     // Cek Kolom Unit
    empObj.witel          // Cek Kolom Daerah / Witel
  ].map(v => _normalizeTextKey(v));

  const hasPensiun = probes.some(v => v.indexOf("pensiun") !== -1);
  const tglPensiunKey = _dateKeyInPensiunTimezone(
    empObj.tgl_pensiun || empObj.tanggal_pensiun || empObj.tglpensiun
  );
  const todayKey = _dateKeyInPensiunTimezone(new Date());
  const isPensiunOverdue = !!tglPensiunKey && !!todayKey && tglPensiunKey <= todayKey;
  if (hasPensiun || isPensiunOverdue) return "PENSIUN";

  const hasMutasi = probes.some(v => v.indexOf("mutasi") !== -1);
  if (hasMutasi) return "MUTASI";

  const hasPromosi = probes.some(v => v.indexOf("promosi") !== -1);
  if (hasPromosi) return "PROMOSI";

  return "";
}

function _sheetHasNik(sheet, nik) {
  const targetNik = String(nik || "").trim();
  if (!targetNik) return false;
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return false;
  const normHeaders = data[0].map(normalizeHeader);
  const nikIdx = _findHeaderIndexByCandidates(normHeaders, ["nik", "n_nik", "nomor_induk"]);
  if (nikIdx === -1) return false;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][nikIdx] || "").trim() === targetNik) return true;
  }
  return false;
}

function _archiveMissingEmployeeRow(ss, dbNormHeaders, dbRow) {
  const rowObj = _rowToObject(dbNormHeaders, dbRow);
  const nik = String(rowObj.nik || "").trim();
  const target = _detectHistoryTarget(rowObj);
  if (!target || !nik) return false;

  const now = _formatTanggalUsulan(new Date());
  const autoNote = "Auto dipindahkan dari DB_KARYAWAN (sinkronisasi massal).";

  if (target === "PENSIUN") {
    const sheetUsulanPensiun = ss.getSheetByName(TABEL_USULAN);
    if (!sheetUsulanPensiun) return false;
    if (_sheetHasNik(sheetUsulanPensiun, nik)) return true;
    const hdrP = sheetUsulanPensiun.getRange(1, 1, 1, sheetUsulanPensiun.getLastColumn()).getValues()[0].map(normalizeHeader);
    const rowP = _buildRowForHeaders(hdrP, rowObj, {
      status_usulan: rowObj.status_usulan || "Menunggu ACC",
      tgl_diusulkan: rowObj.tgl_diusulkan || now,
      catatan: rowObj.catatan || autoNote
    });
    sheetUsulanPensiun.appendRow(rowP);
    return true;
  }

  if (target === "PROMOSI" || target === "MUTASI") {
    // Cek apakah ini usulan pending/dalam proses atau sudah selesai/sejarah (history)
    const statusKey = _normalizeTextKey(rowObj.status_usulan || rowObj.nama_employee_group || "");
    const isPendingUsulan = statusKey.indexOf("menunggu") !== -1 || 
                            statusKey.indexOf("proses") !== -1 || 
                            statusKey.indexOf("pending") !== -1 ||
                            statusKey.indexOf("usulan") !== -1;

    const targetSheetName = isPendingUsulan ? TABEL_USULAN_PROMOSI : TABEL_MUTASI;
    const sheetTarget = ss.getSheetByName(targetSheetName);
    if (!sheetTarget) return false;
    if (_sheetHasNik(sheetTarget, nik)) return true;

    const hdrT = sheetTarget.getRange(1, 1, 1, sheetTarget.getLastColumn()).getValues()[0].map(normalizeHeader);
    const rowT = _buildRowForHeaders(hdrT, rowObj, {
      status_usulan: rowObj.status_usulan || (isPendingUsulan ? "Menunggu ACC" : "Auto Sinkronisasi"),
      tgl_diusulkan: rowObj.tgl_diusulkan || now,
      posisi_awal: rowObj.posisi_awal || rowObj.nama_posisi || "-",
      posisi_usulan: rowObj.posisi_usulan || rowObj.nama_posisi || "-",
      mutasi: rowObj.mutasi || (target === "MUTASI" ? "MUTASI" : "PROMOSI"),
      catatan: rowObj.catatan || autoNote
    });
    sheetTarget.appendRow(rowT);
    return true;
  }

  return false;
}

function _preflightDbSchema() {
  // _autoCheckSheets sudah menangani validasi schema secara menyeluruh
  _autoCheckSheets();
}

/**
 * 1. ENTRY POINT WEB APP
 */
function doGet(e) {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Area 3 TIF Employee Management')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function _autoCheckSheets(force) {
  const cache = CacheService.getScriptCache();
  if (!force && cache.get("schema_checked") === "true") {
    return;
  }
  const ss = getDb();
  _ensureSheetHeaders(ss, TABEL_DB, EMPLOYEE_FLOW_HEADERS, "#0f172a");

  if (!ss.getSheetByName(TABEL_CUTI)) ss.insertSheet(TABEL_CUTI).getRange(1, 1, 1, 8).setValues([["ID_CUTI", "NIK", "NAMA_KARYAWAN", "DIVISI", "TGL_CUTI", "TIPE_CUTI", "STATUS", "CREATED_AT"]]).setFontWeight("bold").setBackground("#0f172a").setFontColor("white");
  if (!ss.getSheetByName(TABEL_KEHADIRAN)) ss.insertSheet(TABEL_KEHADIRAN).getRange(1, 1, 1, 5).setValues([["tanggal", "n_nik", "v_nama_karyawan", "status_pengajuan", "status_cuti"]]).setFontWeight("bold").setBackground("#0f172a").setFontColor("white");
  // TABEL_TEMPLATE dihapus atas permintaan.

  // Sheet alur pensiun selalu memakai layout lengkap yang sama.
  const sheetPensiun = _ensureSheetHeaders(ss, TABEL_PENSIUN, RETIREMENT_FLOW_HEADERS, "#0f172a");
  const sheetUsulan = _ensureSheetHeaders(ss, TABEL_USULAN, RETIREMENT_FLOW_HEADERS, "#7c3aed");
  const sheetUsulanPromosi = _ensureSheetHeaders(ss, TABEL_USULAN_PROMOSI, PROMOTION_FLOW_HEADERS, "#0f172a");
  const sheetMutasi = _ensureSheetHeaders(ss, TABEL_MUTASI, PROMOTION_FLOW_HEADERS, "#dc2626");

  // Hard schema validation
  const sheetDbMain = ss.getSheetByName(TABEL_DB);
  _assertExactSchema(sheetDbMain, EMPLOYEE_FLOW_HEADERS, TABEL_DB);
  _assertRequiredColumns(sheetDbMain, ["no", "nik", "nama_karyawan"], TABEL_DB);
  _assertExactSchema(sheetPensiun, RETIREMENT_FLOW_HEADERS, TABEL_PENSIUN);
  _assertExactSchema(sheetUsulan, RETIREMENT_FLOW_HEADERS, TABEL_USULAN);
  _assertExactSchema(sheetUsulanPromosi, PROMOTION_FLOW_HEADERS, TABEL_USULAN_PROMOSI);
  _assertExactSchema(sheetMutasi, PROMOTION_FLOW_HEADERS, TABEL_MUTASI);
  
  cache.put("schema_checked", "true", 1800); // Cache for 30 minutes
}

function universalSync(syncDataMap) {
  const ss = getDb();

  const updateSheet = (sheetName, nikColName, fieldMapping) => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return;
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return;
    
    const normHeaders = data[0].map(normalizeHeader);
    let nikColIndex = normHeaders.indexOf(normalizeHeader(nikColName));
    if (nikColIndex === -1) return;

    let isUpdated = false;
    for (let i = 1; i < data.length; i++) {
      let nik = String(data[i][nikColIndex]).trim();
      if (syncDataMap[nik]) {
        let updates = syncDataMap[nik];
        for (let key in fieldMapping) {
           let targetHeader = normalizeHeader(fieldMapping[key]);
           let colIdx = normHeaders.indexOf(targetHeader);
           if (colIdx !== -1 && updates[key] !== undefined && updates[key] !== "") {
              data[i][colIdx] = updates[key];
              isUpdated = true;
           }
        }
      }
    }
    if (isUpdated) sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
  };

  // Field yang disinkronkan ke semua sheet terkait saat data master berubah
  const syncMapping = {
    "nama_karyawan"     : "nama_karyawan",
    "usia"              : "usia",
    "nama_posisi"       : "nama_posisi",
    "nama_unit"         : "nama_unit",
    "nama_employee_group": "nama_employee_group",
    "nama_action"       : "nama_action",
    "tgl_mulaikerja"    : "tgl_mulaikerja",
    "tgl_pensiun"       : "tgl_pensiun"
  };

  updateSheet(TABEL_DB,              "nik", syncMapping);
  updateSheet(TABEL_PENSIUN,         "nik", syncMapping);
  updateSheet(TABEL_USULAN,          "nik", syncMapping);
  updateSheet(TABEL_USULAN_PROMOSI,  "nik", syncMapping);
  updateSheet(TABEL_MUTASI,          "nik", syncMapping);
}

function universalDelete(nik) {
  const ss = getDb();
  // Hapus juga dari sheet usulan agar tidak ada data orphan
  const tables = [TABEL_DB, TABEL_PENSIUN, TABEL_CUTI, TABEL_USULAN, TABEL_USULAN_PROMOSI];

  tables.forEach(tableName => {
     let sheet = ss.getSheetByName(tableName);
     if (sheet) {
        let data = sheet.getDataRange().getValues();
        let normHeaders = data[0].map(normalizeHeader);
        let colIdx = normHeaders.indexOf("nik");
        if (colIdx === -1) colIdx = normHeaders.findIndex(h => h.includes("nik"));
        
        if (colIdx !== -1) {
           for (let i = data.length - 1; i >= 1; i--) {
              if (String(data[i][colIdx]).trim() === String(nik).trim()) sheet.deleteRow(i + 1);
           }
        }
     }
  });
}

// ==========================================
// API: EMPLOYEE MASTER DATA
// ==========================================

function getAllDataClient() {
  try {
    _preflightDbSchema();
    const sheet = getDb().getSheetByName(TABEL_DB);
    if (!sheet) return JSON.stringify({ error: true, message: "Sheet DB_KARYAWAN tidak ditemukan." });
    
    const data = sheet.getDataRange().getValues(); 
    if (data.length <= 1) return JSON.stringify([]);
    
    const normHeaders = data[0].map(normalizeHeader);
    let nikIndex = normHeaders.indexOf("nik");
    if (nikIndex === -1) nikIndex = normHeaders.findIndex(h => h.includes("nik"));

    const rows = data.slice(1).filter(row => { 
      if (nikIndex === -1) return true; 
      return row[nikIndex] && row[nikIndex].toString().trim() !== ""; 
    });

    const result = rows.map(row => { 
      let obj = {}; 
      normHeaders.forEach((header, i) => { 
        let v = row[i];
        if (v instanceof Date) {
          // Koreksi tahun 19xx yang muncul akibat penyimpanan 2-digit year di spreadsheet
          const yr = v.getFullYear();
          if (yr >= 1900 && yr <= 1968) {
            v = new Date(yr + 100, v.getMonth(), v.getDate());
          }
          v = Utilities.formatDate(v, PENSIUN_TIMEZONE, "yyyy-MM-dd");
        } else if (v !== null && v !== undefined) {
          v = String(v);
        } else {
          v = "";
        }
        obj[header] = v; 
      }); 
      
      // Auto-Aliasing untuk mencocokkan Frontend dengan Header Spreadsheet
      obj.nik           = obj.nik || obj.n_nik || obj.nomor_induk || "";
      obj.nama_karyawan = obj.nama_karyawan || obj.nama || obj.nama_lengkap || "";
      obj.nomor_hp      = obj.nomor_hp || obj.no_telepon || obj.no_hp || obj.telepon || "";
      obj.nama_unit     = obj.unit_2 || obj.nama_unit || obj.unit_kerja || obj.unit || obj.divisi || "";
      obj.nama_posisi   = obj.nama_posisi || obj.jabatan || obj.posisi || "";
      obj.tgl_mulaikerja= obj.tgl_mulaikerja || obj.tgl_mulai_kerja || obj.tanggal_masuk || "";
      obj.tgl_pensiun   = obj.tgl_pensiun || obj.tanggal_pensiun || "";
      obj.usia          = obj.usia || obj.umur || obj.usia_saat_ini || "";
      obj.jenis_kelamin = obj.jenis_kelamin || obj.gender || obj.kelamin || "";
      obj.nama_employee_group = obj.nama_employee_group || obj.status_pegawai || obj.status || "Aktif";
      obj.nama_action   = obj.nama_action || obj.aksi || obj.jenis_aksi || "";
      obj.pt_tif        = obj.pt_tif || obj.witel || obj.regional || "";
      obj.talent_cluster = obj.talenct_cluster || obj.talent_cluster || "";

      return obj; 
    });
    return JSON.stringify(result); 
  } catch (err) { return JSON.stringify({ error: true, message: err.toString() }); }
}

function updateDataClient(dataObj) {
  try {
    _preflightDbSchema();
    const sheet = getDb().getSheetByName(TABEL_DB);
    const data = sheet.getDataRange().getValues();
    const rawHeaders = data[0];
    const normHeaders = rawHeaders.map(normalizeHeader);
    
    let rowIndex = -1;
    const nikIdx = normHeaders.indexOf("nik");
    
    for (let i = 1; i < data.length; i++) {
      if (nikIdx !== -1 && String(data[i][nikIdx]).trim() === String(dataObj.nik).trim()) { 
        rowIndex = i + 1; break; 
      }
    }
    if (rowIndex === -1) return JSON.stringify({ error: true, message: "Karyawan tidak ditemukan di Database." });
    
    // Reverse alias mapping: agar key bentukan frontend bisa ditangkap oleh header asli spreadsheet
    dataObj["v_employee_group"] = dataObj["v_employee_group"] || dataObj["nama_employee_group"];
    dataObj["talenct_cluster"]  = dataObj["talenct_cluster"] || dataObj["talent_cluster"] || "";
    dataObj["employee_group"]   = dataObj["employee_group"] || dataObj["nama_employee_group"];
    dataObj["v_short_posisi"]   = dataObj["v_short_posisi"] || dataObj["nama_posisi"];
    dataObj["posisi"]           = dataObj["posisi"] || dataObj["nama_posisi"];
    dataObj["v_nama_karyawan"]  = dataObj["v_nama_karyawan"] || dataObj["nama_karyawan"];
    dataObj["v_witel"]          = dataObj["v_witel"] || dataObj["unit_kerja"] || dataObj["nama_unit"];
    dataObj["tgl_mulaikerja_date"] = dataObj["tgl_mulaikerja_date"] || dataObj["tgl_mulaikerja"];
    dataObj["tgl_band_posisi_date"] = dataObj["tgl_band_posisi_date"] || dataObj["tgl_band_posisi"];
    dataObj["tanggal_lahir"]    = dataObj["tanggal_lahir"] || dataObj["tgl_lahir"];
    
    dataObj["updated_at"] = new Date().toISOString();
    
    const updatedRow = rawHeaders.map((header, index) => {
      const normH = normHeaders[index];
      if(dataObj[normH] !== undefined) return dataObj[normH];
      if(dataObj[header] !== undefined) return dataObj[header];
      // Fallback: gunakan nilai dari baris existing jika tidak ada di dataObj
      return data[rowIndex-1][index];
    });
    
    sheet.getRange(rowIndex, 1, 1, rawHeaders.length).setValues([updatedRow]);
    _renumberNoColumn(sheet, normHeaders);
    
    let syncMap = {}; syncMap[dataObj.nik] = dataObj;
    universalSync(syncMap);

    return JSON.stringify({ success: true, message: "Data Master diperbarui & Tersinkronisasi Global." });
  } catch (err) { return JSON.stringify({ error: true, message: err.toString() }); }
}

function bulkImportClient(dataArray) {
  try {
    _preflightDbSchema();
    const ss = getDb();
    const sheet = ss.getSheetByName(TABEL_DB);
    if (!dataArray || dataArray.length === 0) return JSON.stringify({ error: true, message: "Data kosong." });
    
    const rawHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const normHeaders = rawHeaders.map(normalizeHeader);
    const timeNow = new Date().toISOString();
    
    let syncMap = {};
    const dataExisting = sheet.getDataRange().getValues();
    const originalLastRow = dataExisting.length;
    const noIdx = normHeaders.indexOf("no");
    const nikIdx = _findHeaderIndexByCandidates(normHeaders, ["nik", "n_nik", "nomor_induk"]);
    const namaIdx = _findHeaderIndexByCandidates(normHeaders, ["nama_karyawan", "nama", "nama_lengkap"]);
    let maxNo = 0;
    if (noIdx !== -1 && dataExisting.length > 1) {
      for (let i = 1; i < dataExisting.length; i++) {
        const n = parseInt(String(dataExisting[i][noIdx] || "").replace(/[^\d-]/g, ''), 10);
        if (!isNaN(n) && n > maxNo) maxNo = n;
      }
    }

    let nikRowMap = {};
    let namaRowMap = {};
    for (let i = 1; i < dataExisting.length; i++) {
      const cellNik = nikIdx !== -1 ? String(dataExisting[i][nikIdx] || "").trim() : "";
      const cellNama = namaIdx !== -1 ? _normalizeTextKey(dataExisting[i][namaIdx]) : "";
      if (cellNik) nikRowMap[cellNik] = i + 1;
      if (cellNama && namaRowMap[cellNama] === undefined) namaRowMap[cellNama] = i + 1;
    }

    const incomingNikSet = {};
    const incomingNamaSet = {};
    const rowsToInsert = [];
    let insertedCount = 0;
    let updatedCount = 0;
    let movedToHistoryCount = 0;

    dataArray.forEach((obj) => {
      let normObj = {};
      for (let key in obj) normObj[normalizeHeader(key)] = obj[key];

      normObj.nik = String(normObj.nik || normObj.n_nik || normObj.nomor_induk || "").trim();
      normObj.nama_karyawan = String(normObj.nama_karyawan || normObj.nama || normObj.nama_lengkap || "").trim();
      normObj.talenct_cluster = normObj.talenct_cluster || normObj.talent_cluster || normObj.talentcluster || "";
      normObj.updated_at = timeNow;

      const namaKey = _normalizeTextKey(normObj.nama_karyawan);
      if (normObj.nik) incomingNikSet[normObj.nik] = true;
      if (namaKey) incomingNamaSet[namaKey] = true;

      let rowIndex = -1;
      if (normObj.nik && nikRowMap[normObj.nik]) {
        rowIndex = nikRowMap[normObj.nik];
      } else if (namaKey && namaRowMap[namaKey]) {
        rowIndex = namaRowMap[namaKey];
      }

      if (rowIndex > 1) {
        const currentRow = dataExisting[rowIndex - 1];
        const updatedRow = rawHeaders.map((header, index) => {
          const normH = normHeaders[index];
          if (normH === "no") return currentRow[index];
          if (normH === "created_at") return currentRow[index];
          if (normH === "updated_at") return timeNow;

          return normObj[normH] !== undefined && normObj[normH] !== "" ? normObj[normH] : currentRow[index];
        });

        sheet.getRange(rowIndex, 1, 1, rawHeaders.length).setValues([updatedRow]);
        dataExisting[rowIndex - 1] = updatedRow;
        updatedCount++;

        const keyNik = nikIdx !== -1 ? String(updatedRow[nikIdx] || "").trim() : normObj.nik;
        if (keyNik) syncMap[keyNik] = normObj;
      } else {
        const sysId = "INX-" + Math.floor(100000 + Math.random() * 900000);
        const row = normHeaders.map((header) => {
          if (header === "no") return "";
          if (header === "system_id") return sysId;
          if (header === "created_at" || header === "updated_at") return timeNow;

          return normObj[header] !== undefined ? normObj[header] : "";
        });
        rowsToInsert.push(row);
        insertedCount++;
        if (normObj.nik) syncMap[normObj.nik] = normObj;
      }
    });

    if (originalLastRow > 1) {
      const rowsToDelete = [];
      for (let i = 1; i < originalLastRow; i++) {
        const row = dataExisting[i];
        if (!row) continue;
        const nik = nikIdx !== -1 ? String(row[nikIdx] || "").trim() : "";
        const nama = namaIdx !== -1 ? _normalizeTextKey(row[namaIdx]) : "";
        const existsInIncoming = (nik && incomingNikSet[nik]) || (nama && incomingNamaSet[nama]);
        if (existsInIncoming) continue;

        const moved = _archiveMissingEmployeeRow(ss, normHeaders, row);
        if (moved) {
          rowsToDelete.push(i + 1);
          movedToHistoryCount++;
        }
      }

      rowsToDelete.sort((a, b) => b - a).forEach(rowNum => sheet.deleteRow(rowNum));
    }

    if (rowsToInsert.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rowsToInsert.length, rawHeaders.length).setValues(rowsToInsert);
    }
    _renumberNoColumn(sheet, normHeaders);
    
    universalSync(syncMap); 
    return JSON.stringify({
      success: true,
      message: `${insertedCount} data baru, ${updatedCount} data diperbarui, ${movedToHistoryCount} data dipindahkan ke riwayat.`
    });
  } catch (err) { return JSON.stringify({ error: true, message: err.toString() }); }
}

function bulkUpdateClient(dataArray) {
  try {
    _preflightDbSchema();
    const sheet = getDb().getSheetByName(TABEL_DB);
    const data = sheet.getDataRange().getValues();
    const rawHeaders = data[0];
    const normHeaders = rawHeaders.map(normalizeHeader);
    
    let nikRowMap = {};
    const nikIdx = normHeaders.indexOf("nik");
    if(nikIdx === -1) return JSON.stringify({ error: true, message: "Kolom NIK tidak ditemukan di Sheet."});

    for (let i = 1; i < data.length; i++) { 
      let cellNik = String(data[i][nikIdx]).trim();
      if (cellNik) nikRowMap[cellNik] = i; 
    }
    
    let updatedCount = 0; let syncMap = {};
    dataArray.forEach(rawObj => {
      // Normalisasi Object Key dari File Excel yg diupload
      let obj = {};
      for(let key in rawObj) { obj[normalizeHeader(key)] = rawObj[key]; }
      obj.talenct_cluster = obj.talenct_cluster || obj.talent_cluster || obj.talentcluster || "";

      let nik = String(obj.nik).trim();
      if (nik && nikRowMap[nik]) {
        let rowIndex = nikRowMap[nik] + 1; 
        obj["updated_at"] = new Date().toISOString();
        
        let updatedRow = rawHeaders.map((header, index) => {
           let normH = normHeaders[index];
           if (normH === 'no') return rowIndex - 1;

           if (normH === 'talenct_cluster' && obj['talenct_cluster'] !== undefined) return obj['talenct_cluster'];
           return obj[normH] !== undefined ? obj[normH] : data[rowIndex-1][index];
        });
        
        sheet.getRange(rowIndex, 1, 1, rawHeaders.length).setValues([updatedRow]);
        data[rowIndex-1] = updatedRow; 
        updatedCount++;
        syncMap[nik] = obj;
      }
    });
    _renumberNoColumn(sheet, normHeaders);
    universalSync(syncMap); 
    return JSON.stringify({ success: true, message: `${updatedCount} diperbarui & tersinkronisasi massal.` });
  } catch (err) { return JSON.stringify({ error: true, message: err.toString() }); }
}

function deleteDataClient(nik) {
  try {
    _preflightDbSchema();
    universalDelete(nik);
    const sheet = getDb().getSheetByName(TABEL_DB);
    const normHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(normalizeHeader);
    _renumberNoColumn(sheet, normHeaders);
    return JSON.stringify({ success: true, message: "Data Karyawan dihapus secara permanen dari semua database." });
  } catch (err) { return JSON.stringify({ error: true, message: err.toString() }); }
}

// ==========================================
// API: PENSIUN
// ==========================================

function getPensiunDataClient() {
  try {
    _autoCheckSheets();
    const sheet = getDb().getSheetByName(TABEL_PENSIUN);
    if (!sheet) return JSON.stringify([]);
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return JSON.stringify([]);
    
    const normHeaders = data[0].map(normalizeHeader);
    const nikIdx = normHeaders.indexOf("nik");
    const DATE_COLS = ["tgl_pensiun", "tgl_mulaikerja", "tgl_mulai_kerja", "tanggal_pensiun",
                       "tgl_capeg", "tgl_pegprus", "tgl_psa", "tgl_divisi", "tgl_unit",
                       "tgl_posisi", "tgl_band_posisi"];
    const rows = data.slice(1).filter(r => nikIdx === -1 ? r[0] : r[nikIdx]); 
    
    return JSON.stringify(rows.map(row => { 
      let obj = {}; 
      normHeaders.forEach((h, i) => { 
        let cellValue = row[i];
        if (cellValue instanceof Date) {
          // Koreksi tanggal yang ter-encode sebagai tahun 19xx (akibat 2-digit year di spreadsheet)
          let yr = cellValue.getFullYear();
          if (yr >= 1900 && yr <= 1968) {
            cellValue = new Date(yr + 100, cellValue.getMonth(), cellValue.getDate());
          }
          cellValue = Utilities.formatDate(cellValue, PENSIUN_TIMEZONE, "yyyy-MM-dd");
        } else if (cellValue && DATE_COLS.includes(h)) {
          // Handle text dates (misal "1/7/35" yang tidak ter-parse sebagai Date object)
          const s = String(cellValue).trim();
          const mDY = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
          if (mDY) {
            let yr = parseInt(mDY[3]);
            if (yr < 100) yr = yr <= 50 ? 2000 + yr : 1900 + yr;
            if (yr >= 1900 && yr <= 1968) yr += 100;
            const mo = String(parseInt(mDY[1])).padStart(2,'0');
            const dy = String(parseInt(mDY[2])).padStart(2,'0');
            cellValue = `${yr}-${mo}-${dy}`;
          }
        }
        obj[h] = cellValue; 
      }); 
      
      // Auto-alias
      obj.nama_karyawan = obj.nama_karyawan || obj.nama || "";
      obj.nama_posisi = obj.nama_posisi || obj.jabatan || "";
      obj.nama_unit = obj.nama_unit || obj.unit_kerja || "";
      obj.nama_employee_group = obj.nama_employee_group || obj.status_pegawai || "";
      obj.tgl_mulaikerja = obj.tgl_mulaikerja || obj.tgl_mulai_kerja || "";
      obj.tgl_pensiun = obj.tgl_pensiun || obj.tanggal_pensiun || "";
      obj.talent_cluster = obj.talenct_cluster || obj.talent_cluster || obj.talent || obj.cluster_talent || "";
      
      return obj; 
    }));
  } catch(e) { return JSON.stringify({ error: true, message: e.toString() }); }
}

// ==========================================
// API: USULAN PENSIUN (Sheet Sementara)
// ==========================================

/**
 * Mengusulkan karyawan untuk pensiun.
 * Data masuk ke sheet USULAN_PENSIUN dengan status "Menunggu ACC".
 * Data di DB_KARYAWAN di-update nama_employee_group jadi "Dalam Proses Pensiun".
 */
function usulkanPensiunClient(empData) {
  try {
    _autoCheckSheets();
    const ss = getDb();
    const nik = String((empData && empData.nik) || "").trim();
    if (!nik) return JSON.stringify({ error: true, message: "NIK karyawan tidak ditemukan." });

    const sheetUsulan = ss.getSheetByName(TABEL_USULAN);
    const dataUsulan  = sheetUsulan.getDataRange().getValues();
    const normHdrU    = dataUsulan[0].map(normalizeHeader);

    // Cek apakah sudah ada usulan yang sama (belum diproses)
    const nikIdx = normHdrU.indexOf("nik");
    const statIdx = normHdrU.indexOf("status_usulan");
    if (nikIdx === -1 || statIdx === -1) {
      return JSON.stringify({ error: true, message: "Header USULAN_PENSIUN belum sesuai." });
    }
    for (let i = 1; i < dataUsulan.length; i++) {
      if (String(dataUsulan[i][nikIdx]).trim() === nik &&
          String(dataUsulan[i][statIdx]).trim() === "Menunggu ACC") {
        return JSON.stringify({ error: true, message: "Karyawan ini sudah memiliki usulan pensiun yang sedang menunggu ACC." });
      }
    }

    // Ambil data lengkap dari DB_KARYAWAN agar sheet usulan tidak bergantung pada payload frontend.
    const sheetKar = ss.getSheetByName(TABEL_DB);
    const dataKar  = sheetKar.getDataRange().getValues();
    const normHdrK = dataKar[0].map(normalizeHeader);
    const nikKIdx  = normHdrK.indexOf("nik");
    if (nikKIdx === -1) {
      return JSON.stringify({ error: true, message: "Kolom NIK tidak ditemukan di DB_KARYAWAN." });
    }

    let karRow = null, karRowIdx = -1;
    for (let i = 1; i < dataKar.length; i++) {
      if (String(dataKar[i][nikKIdx]).trim() === nik) {
        karRow = dataKar[i];
        karRowIdx = i + 1;
        break;
      }
    }
    if (!karRow) {
      return JSON.stringify({ error: true, message: "Data karyawan tidak ditemukan di DB_KARYAWAN." });
    }

    const empObj = _normalizeEmpObj(_rowToObject(normHdrK, karRow));
    const now = _formatTanggalUsulan(new Date());
    const newRow = _buildRowForHeaders(normHdrU, empObj, {
      status_usulan: "Menunggu ACC",
      tgl_diusulkan: now,
      catatan: empData.catatan || "-"
    });
    sheetUsulan.appendRow(newRow);

    // Update status proses di DB_KARYAWAN setelah snapshot usulan tersimpan.
    const empGrpIdx = normHdrK.indexOf("nama_employee_group");
    if (empGrpIdx !== -1) {
      sheetKar.getRange(karRowIdx, empGrpIdx + 1).setValue("Dalam Proses Pensiun");
    }

    return JSON.stringify({ success: true, message: "Usulan pensiun berhasil diajukan dan menunggu ACC." });
  } catch(e) { return JSON.stringify({ error: true, message: e.toString() }); }
}

// Jalankan fungsi ini sekali dari Apps Script Editor untuk memasang trigger bulanan.
function pasangTriggerUsulanPensiunOtomatis() {
  const removedCount = _hapusTriggerUsulanPensiunOtomatis();
  ScriptApp.newTrigger(AUTO_USULAN_PENSIUN_HANDLER)
    .timeBased()
    .onMonthDay(1)
    .atHour(8)
    .nearMinute(0)
    .inTimezone(PENSIUN_TIMEZONE)
    .create();

  return `Trigger usulan pensiun otomatis dipasang untuk tanggal 1 sekitar pukul 08.00 WIB. Trigger lama dihapus: ${removedCount}.`;
}

function hapusTriggerUsulanPensiunOtomatis() {
  const removedCount = _hapusTriggerUsulanPensiunOtomatis();
  return `Trigger usulan pensiun otomatis yang dihapus: ${removedCount}.`;
}

function _hapusTriggerUsulanPensiunOtomatis() {
  let removedCount = 0;
  ScriptApp.getProjectTriggers().forEach(trigger => {
    if (trigger.getHandlerFunction() === AUTO_USULAN_PENSIUN_HANDLER) {
      ScriptApp.deleteTrigger(trigger);
      removedCount++;
    }
  });
  return removedCount;
}

/**
 * Memindahkan data DB_KARYAWAN yang tanggal pensiunnya sudah jatuh tempo ke USULAN_PENSIUN.
 * Dipanggil trigger pada tanggal 1 sekitar pukul 08.00 WIB.
 */
function prosesAutoUsulanPensiunBulanan() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    return JSON.stringify({ error: true, message: "Proses usulan pensiun otomatis sedang berjalan." });
  }

  try {
    _autoCheckSheets();
    const ss = getDb();
    const sheetKar = ss.getSheetByName(TABEL_DB);
    const sheetUsulan = ss.getSheetByName(TABEL_USULAN);
    const dataKar = sheetKar.getDataRange().getValues();
    const dataUsulan = sheetUsulan.getDataRange().getValues();
    if (dataKar.length <= 1) {
      return JSON.stringify({ success: true, processed: 0, message: "DB_KARYAWAN belum memiliki data." });
    }

    const normHdrK = dataKar[0].map(normalizeHeader);
    const normHdrU = dataUsulan[0].map(normalizeHeader);
    const nikKIdx = normHdrK.indexOf("nik");
    const tglPensiunIdx = _findHeaderIndexByCandidates(normHdrK, ["tgl_pensiun", "tanggal_pensiun", "tglpensiun"]);
    const empGrpIdx = normHdrK.indexOf("nama_employee_group");
    const nikUIdx = normHdrU.indexOf("nik");
    const statUIdx = normHdrU.indexOf("status_usulan");
    if (nikKIdx === -1 || tglPensiunIdx === -1) {
      return JSON.stringify({ error: true, message: "Kolom nik atau tgl_pensiun tidak ditemukan di DB_KARYAWAN." });
    }
    if (nikUIdx === -1 || statUIdx === -1) {
      return JSON.stringify({ error: true, message: "Header USULAN_PENSIUN belum sesuai." });
    }

    const now = new Date();
    const todayKey = _dateKeyInPensiunTimezone(now);
    const tglDiusulkan = _formatTanggalUsulan(now);
    const pendingNik = new Set();
    for (let i = 1; i < dataUsulan.length; i++) {
      const nikUsulan = String(dataUsulan[i][nikUIdx] || "").trim();
      const statusUsulan = String(dataUsulan[i][statUIdx] || "").trim();
      if (nikUsulan && statusUsulan === "Menunggu ACC") pendingNik.add(nikUsulan);
    }

    const rowsToAppend = [];
    const employeeRowsToMark = [];
    let skippedPending = 0;
    let skippedInvalidDate = 0;

    for (let i = 1; i < dataKar.length; i++) {
      const row = dataKar[i];
      const nik = String(row[nikKIdx] || "").trim();
      if (!nik) continue;
      if (pendingNik.has(nik)) {
        skippedPending++;
        continue;
      }

      const tglPensiunKey = _dateKeyInPensiunTimezone(row[tglPensiunIdx]);
      if (!tglPensiunKey) {
        skippedInvalidDate++;
        continue;
      }
      if (tglPensiunKey > todayKey) continue;

      rowsToAppend.push(_buildRowForHeaders(normHdrU, _normalizeEmpObj(_rowToObject(normHdrK, row)), {
        status_usulan: "Menunggu ACC",
        tgl_diusulkan: tglDiusulkan,
        catatan: "Usulan otomatis: tanggal pensiun sudah jatuh tempo."
      }));
      employeeRowsToMark.push(i + 1);
      pendingNik.add(nik);
    }

    if (rowsToAppend.length > 0) {
      sheetUsulan
        .getRange(sheetUsulan.getLastRow() + 1, 1, rowsToAppend.length, normHdrU.length)
        .setValues(rowsToAppend);

      if (empGrpIdx !== -1) {
        employeeRowsToMark.forEach(rowIndex => {
          sheetKar.getRange(rowIndex, empGrpIdx + 1).setValue("Dalam Proses Pensiun");
        });
      }
    }

    return JSON.stringify({
      success: true,
      processed: rowsToAppend.length,
      skipped_pending: skippedPending,
      skipped_invalid_date: skippedInvalidDate,
      message: `${rowsToAppend.length} karyawan otomatis masuk USULAN_PENSIUN.`
    });
  } catch(e) {
    return JSON.stringify({ error: true, message: e.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Mengambil semua usulan pensiun dari sheet USULAN_PENSIUN.
 */
function getUsulanPensiunClient() {
  try {
    _autoCheckSheets();
    const sheet = getDb().getSheetByName(TABEL_USULAN);
    const data  = sheet.getDataRange().getValues();
    if (data.length <= 1) return JSON.stringify([]);
    const normHeaders = data[0].map(normalizeHeader);
    const nikIdx = normHeaders.indexOf("nik");
    const rows = data.slice(1).filter(r => nikIdx === -1 ? r[0] : r[nikIdx]);
    return JSON.stringify(rows.map((row, rowIdx) => {
      let obj = { _rowIndex: rowIdx + 2 };
      normHeaders.forEach((h, i) => {
        let val = row[i];
        if (val instanceof Date) {
          val = Utilities.formatDate(val, PENSIUN_TIMEZONE, "yyyy-MM-dd");
        }
        obj[h] = val;
      });
      obj.nama_karyawan = obj.nama_karyawan || obj.nama || "";
      obj.nama_posisi   = obj.jabatan || obj.nama_posisi || "";
      obj.nama_unit     = obj.unit_kerja || obj.nama_unit || "";
      obj.tgl_mulaikerja = obj.tgl_mulai_kerja || obj.tgl_mulaikerja || "";
      obj.tgl_pensiun = obj.tgl_pensiun || obj.tanggal_pensiun || "";
      obj.nama_employee_group = obj.status_pegawai || obj.nama_employee_group || "";
      obj.talent_cluster = obj.talenct_cluster || obj.talent_cluster || obj.talent || obj.cluster_talent || "";
      return obj;
    }));
  } catch(e) { return JSON.stringify({ error: true, message: e.toString() }); }
}

/**
 * ACC usulan pensiun:
 * 1. Pindahkan data dari DB_KARYAWAN ke DB_PENSIUN
 * 2. Hapus row dari DB_KARYAWAN
 * 3. Hapus row dari USULAN_PENSIUN (atau tandai sebagai "Disetujui")
 */
function accUsulanPensiunClient(nik) {
  try {
    _autoCheckSheets();
    const ss = getDb();
    const targetNik = String(nik || "").trim();
    if (!targetNik) return JSON.stringify({ error: true, message: "NIK karyawan tidak ditemukan." });

    // --- 1. Ambil baris usulan lengkap untuk dipindahkan ke DB_PENSIUN ---
    const sheetUsulan = ss.getSheetByName(TABEL_USULAN);
    const dataUsulan  = sheetUsulan.getDataRange().getValues();
    const normHdrU    = dataUsulan[0].map(normalizeHeader);
    const nikUIdx     = normHdrU.indexOf("nik");
    if (nikUIdx === -1) {
      return JSON.stringify({ error: true, message: "Kolom NIK tidak ditemukan di USULAN_PENSIUN." });
    }

    let usulanRow = null, usulanRowIdx = -1;
    for (let i = 1; i < dataUsulan.length; i++) {
      if (String(dataUsulan[i][nikUIdx]).trim() === targetNik) {
        usulanRow = dataUsulan[i];
        usulanRowIdx = i + 1;
        break;
      }
    }
    if (!usulanRow) {
      return JSON.stringify({ error: true, message: "Usulan pensiun tidak ditemukan." });
    }
    const usulanObj = _rowToObject(normHdrU, usulanRow);
    
    // --- 2. Pastikan data sumber di DB_KARYAWAN masih ada sebelum dipindahkan ---
    const sheetKar  = ss.getSheetByName(TABEL_DB);
    const dataKar   = sheetKar.getDataRange().getValues();
    const normHdrK  = dataKar[0].map(normalizeHeader);
    const nikKIdx   = normHdrK.indexOf("nik");
    if (nikKIdx === -1) {
      return JSON.stringify({ error: true, message: "Kolom NIK tidak ditemukan di DB_KARYAWAN." });
    }

    let karRowIdx = -1;
    for (let i = 1; i < dataKar.length; i++) {
      if (String(dataKar[i][nikKIdx]).trim() === targetNik) {
        karRowIdx = i + 1;
        break;
      }
    }
    if (karRowIdx === -1) {
      return JSON.stringify({ error: true, message: "Data karyawan tidak ditemukan di DB_KARYAWAN." });
    }

    // --- 3. Tambahkan baris lengkap ke DB_PENSIUN ---
    const sheetPensiun = ss.getSheetByName(TABEL_PENSIUN);
    const dataPensiun  = sheetPensiun.getDataRange().getValues();
    const normHdrP     = dataPensiun[0].map(normalizeHeader);
    const newRowP = _buildRowForHeaders(normHdrP, usulanObj, {
      status_usulan: "Disetujui"
    });
    sheetPensiun.appendRow(newRowP);

    // --- 4. Hapus row dari DB_KARYAWAN ---
    sheetKar.deleteRow(karRowIdx);

    // --- 5. Hapus row dari USULAN_PENSIUN ---
    sheetUsulan.deleteRow(usulanRowIdx);

    // Hapus juga di TABEL_CUTI jika ada
    const sheetCuti = ss.getSheetByName(TABEL_CUTI);
    if (sheetCuti) {
      const dataCuti = sheetCuti.getDataRange().getValues();
      const normHdrC = dataCuti[0].map(normalizeHeader);
      const nikCIdx  = normHdrC.findIndex(h => h.includes("nik"));
      if (nikCIdx !== -1) {
        for (let i = dataCuti.length - 1; i >= 1; i--) {
          if (String(dataCuti[i][nikCIdx]).trim() === targetNik) {
            sheetCuti.deleteRow(i + 1);
          }
        }
      }
    }

    return JSON.stringify({ success: true, message: "Pensiun ACC! Data berhasil dipindah ke DB_PENSIUN dan dihapus dari DB_KARYAWAN." });
  } catch(e) { return JSON.stringify({ error: true, message: e.toString() }); }
}

/**
 * Tolak usulan pensiun:
 * 1. Hapus dari USULAN_PENSIUN
 * 2. Kembalikan status_pegawai di DB_KARYAWAN ke "Aktif"
 */
function tolakUsulanPensiunClient(nik) {
  try {
    _autoCheckSheets();
    const ss = getDb();

    // Hapus dari USULAN_PENSIUN
    const sheetUsulan = ss.getSheetByName(TABEL_USULAN);
    const dataUsulan  = sheetUsulan.getDataRange().getValues();
    const normHdrU    = dataUsulan[0].map(normalizeHeader);
    const nikUIdx     = normHdrU.indexOf("nik");
    for (let i = dataUsulan.length - 1; i >= 1; i--) {
      if (String(dataUsulan[i][nikUIdx]).trim() === String(nik).trim()) {
        sheetUsulan.deleteRow(i + 1); break;
      }
    }

    // Kembalikan status di DB_KARYAWAN
    const sheetKar = ss.getSheetByName(TABEL_DB);
    const dataKar  = sheetKar.getDataRange().getValues();
    const normHdrK = dataKar[0].map(normalizeHeader);
    const nikKIdx  = normHdrK.indexOf("nik");
    const empGrpIdx = normHdrK.indexOf("nama_employee_group");
    if (nikKIdx !== -1 && empGrpIdx !== -1) {
      for (let i = 1; i < dataKar.length; i++) {
        if (String(dataKar[i][nikKIdx]).trim() === String(nik).trim()) {
          sheetKar.getRange(i + 1, empGrpIdx + 1).setValue("Aktif");
          break;
        }
      }
    }

    return JSON.stringify({ success: true, message: "Usulan pensiun ditolak. Status karyawan dikembalikan ke Aktif." });
  } catch(e) { return JSON.stringify({ error: true, message: e.toString() }); }
}

// ==========================================
// API: USULAN PROMOSI / MUTASI
// ==========================================

function usulkanPromosiClient(empData) {
  try {
    _autoCheckSheets();
    const ss = getDb();
    const nik = String((empData && empData.nik) || "").trim();
    if (!nik) return JSON.stringify({ error: true, message: "NIK karyawan tidak ditemukan." });

    const posisiUsulan = String((empData && empData.posisi_usulan) || "").trim();
    if (!posisiUsulan) return JSON.stringify({ error: true, message: "Posisi usulan wajib diisi." });

    const jenisUsulanRaw = String((empData && empData.jenis_usulan) || "PROMOSI").trim().toUpperCase();
    const jenisUsulan = jenisUsulanRaw === "MUTASI" ? "MUTASI" : "PROMOSI";
    const mutasiField = jenisUsulan === "MUTASI" ? "MUTASI" : "-";

    const sheetUsulan = ss.getSheetByName(TABEL_USULAN_PROMOSI);
    const dataUsulan = sheetUsulan.getDataRange().getValues();
    const normHdrU = dataUsulan[0].map(normalizeHeader);
    const nikUIdx = normHdrU.indexOf("nik");
    const statUIdx = normHdrU.indexOf("status_usulan");
    if (nikUIdx === -1 || statUIdx === -1) {
      return JSON.stringify({ error: true, message: "Header USULAN_PROMOSI_MUTASI belum sesuai." });
    }

    for (let i = 1; i < dataUsulan.length; i++) {
      const rowNik = String(dataUsulan[i][nikUIdx] || "").trim();
      const rowStatus = String(dataUsulan[i][statUIdx] || "").trim();
      if (rowNik === nik && rowStatus === "Menunggu ACC") {
        return JSON.stringify({ error: true, message: "Karyawan ini sudah punya usulan promosi/mutasi yang menunggu ACC." });
      }
    }

    const sheetKar = ss.getSheetByName(TABEL_DB);
    const dataKar = sheetKar.getDataRange().getValues();
    const normHdrK = dataKar[0].map(normalizeHeader);
    const nikKIdx = normHdrK.indexOf("nik");
    if (nikKIdx === -1) {
      return JSON.stringify({ error: true, message: "Kolom NIK tidak ditemukan di DB_KARYAWAN." });
    }

    let karRow = null;
    for (let i = 1; i < dataKar.length; i++) {
      if (String(dataKar[i][nikKIdx] || "").trim() === nik) {
        karRow = dataKar[i];
        break;
      }
    }
    if (!karRow) return JSON.stringify({ error: true, message: "Data karyawan tidak ditemukan di DB_KARYAWAN." });

    const empObj = _normalizeEmpObj(_rowToObject(normHdrK, karRow));
    const posisiAwal = String(empObj.nama_posisi || empObj.jabatan || "-").trim() || "-";
    const unitUsulan = String(
      (empData && (empData.unit_usulan || empData.nama_unit)) || empObj.nama_unit || "-"
    ).trim() || "-";
    const bandUsulan = String((empData && empData.band_posisi) || empObj.band_posisi || "-").trim() || "-";
    const talentUsulan = String((empData && empData.talent_cluster) || empObj.talent_cluster || "-").trim() || "-";
    const nilaiKinerjaUsulan = String((empData && empData.nilai_kinerja) || empObj.nilai_kinerja || "-").trim() || "-";
    const nilaiKompetensiUsulan = String((empData && empData.nilai_kompetensi) || empObj.nilai_kompetensi || "-").trim() || "-";
    const nilaiBehaviorUsulan = String((empData && empData.nilai_behavior) || empObj.nilai_behavior || "-").trim() || "-";
    const tglPosisiUsulan = String((empData && empData.tgl_posisi) || "").trim();
    const now = _formatTanggalUsulan(new Date());
    const newRow = _buildRowForHeaders(normHdrU, empObj, {
      status_usulan: "Menunggu ACC",
      tgl_diusulkan: now,
      posisi_awal: posisiAwal,
      posisi_usulan: posisiUsulan,
      nama_unit: unitUsulan,
      band_posisi: bandUsulan,
      talent_cluster: talentUsulan,
      nilai_kinerja: nilaiKinerjaUsulan,
      nilai_kompetensi: nilaiKompetensiUsulan,
      nilai_behavior: nilaiBehaviorUsulan,
      tgl_posisi: tglPosisiUsulan,
      mutasi: mutasiField,
      catatan: (empData && empData.catatan) ? String(empData.catatan) : "-"
    });
    sheetUsulan.appendRow(newRow);

    return JSON.stringify({ success: true, message: "Usulan promosi/mutasi berhasil diajukan." });
  } catch(e) { return JSON.stringify({ error: true, message: e.toString() }); }
}

function getUsulanPromosiClient() {
  try {
    _autoCheckSheets();
    const sheet = getDb().getSheetByName(TABEL_USULAN_PROMOSI);
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return JSON.stringify([]);

    const normHeaders = data[0].map(normalizeHeader);
    const nikIdx = normHeaders.indexOf("nik");
    const rows = data.slice(1).filter(r => nikIdx === -1 ? r[0] : r[nikIdx]);

    return JSON.stringify(rows.map((row, rowIdx) => {
      const obj = { _rowIndex: rowIdx + 2 };
      normHeaders.forEach((h, i) => {
        let val = row[i];
        if (val instanceof Date) {
          val = Utilities.formatDate(val, PENSIUN_TIMEZONE, "yyyy-MM-dd");
        }
        obj[h] = val;
      });
      obj.nama_karyawan = obj.nama_karyawan || obj.nama || "";
      obj.nama_posisi = obj.nama_posisi || obj.jabatan || "";
      obj.nama_unit = obj.nama_unit || obj.unit_kerja || "";
      obj.tgl_mulaikerja = obj.tgl_mulaikerja || obj.tgl_mulai_kerja || "";
      obj.tgl_pensiun = obj.tgl_pensiun || obj.tanggal_pensiun || "";
      obj.talent_cluster = obj.talenct_cluster || obj.talent_cluster || obj.talent || obj.cluster_talent || "";
      return obj;
    }));
  } catch(e) { return JSON.stringify({ error: true, message: e.toString() }); }
}

function accUsulanPromosiClient(nik) {
  try {
    _autoCheckSheets();
    const ss = getDb();
    const targetNik = String(nik || "").trim();
    if (!targetNik) return JSON.stringify({ error: true, message: "NIK karyawan tidak ditemukan." });

    const sheetUsulan = ss.getSheetByName(TABEL_USULAN_PROMOSI);
    const dataUsulan = sheetUsulan.getDataRange().getValues();
    const normHdrU = dataUsulan[0].map(normalizeHeader);
    const nikUIdx = normHdrU.indexOf("nik");
    if (nikUIdx === -1) return JSON.stringify({ error: true, message: "Kolom NIK tidak ditemukan di USULAN_PROMOSI_MUTASI." });

    let usulanRow = null, usulanRowIdx = -1;
    for (let i = 1; i < dataUsulan.length; i++) {
      if (String(dataUsulan[i][nikUIdx] || "").trim() === targetNik) {
        usulanRow = dataUsulan[i];
        usulanRowIdx = i + 1;
        break;
      }
    }
    if (!usulanRow) return JSON.stringify({ error: true, message: "Usulan promosi/mutasi tidak ditemukan." });

    const usulanObj = _rowToObject(normHdrU, usulanRow);
    const isMutasi = String(usulanObj.mutasi || "").toUpperCase().includes("MUTASI");

    const sheetKar = ss.getSheetByName(TABEL_DB);
    const dataKar = sheetKar.getDataRange().getValues();
    const normHdrK = dataKar[0].map(normalizeHeader);
    const nikKIdx = normHdrK.indexOf("nik");
    if (nikKIdx === -1) return JSON.stringify({ error: true, message: "Kolom NIK tidak ditemukan di DB_KARYAWAN." });

    let karRowIdx = -1;
    for (let i = 1; i < dataKar.length; i++) {
      if (String(dataKar[i][nikKIdx] || "").trim() === targetNik) {
        karRowIdx = i + 1;
        break;
      }
    }
    if (karRowIdx === -1) {
      return JSON.stringify({ error: true, message: "Data karyawan tidak ditemukan di DB_KARYAWAN." });
    }

    if (isMutasi) {
      const sheetMutasi = ss.getSheetByName(TABEL_MUTASI);
      const dataMutasi = sheetMutasi.getDataRange().getValues();
      const normHdrM = dataMutasi[0].map(normalizeHeader);
      const rowMutasi = _buildRowForHeaders(normHdrM, usulanObj, { status_usulan: "Disetujui" });
      sheetMutasi.appendRow(rowMutasi);

      sheetKar.deleteRow(karRowIdx);
    } else {
      const posisiIdx = normHdrK.indexOf("nama_posisi");
      if (posisiIdx === -1) {
        return JSON.stringify({ error: true, message: "Kolom nama_posisi tidak ditemukan di DB_KARYAWAN." });
      }
      const updatedAtIdx = normHdrK.indexOf("updated_at");
      sheetKar.getRange(karRowIdx, posisiIdx + 1).setValue(usulanObj.posisi_usulan || usulanObj.nama_posisi || "");
      if (updatedAtIdx !== -1) {
        sheetKar.getRange(karRowIdx, updatedAtIdx + 1).setValue(new Date().toISOString());
      }
    }

    sheetUsulan.deleteRow(usulanRowIdx);

    return JSON.stringify({
      success: true,
      message: isMutasi
        ? "Usulan mutasi disetujui. Data dipindah ke sheet MUTASI dan dihapus dari DB_KARYAWAN."
        : "Usulan promosi disetujui. Jabatan di DB_KARYAWAN berhasil diperbarui."
    });
  } catch(e) { return JSON.stringify({ error: true, message: e.toString() }); }
}

function tolakUsulanPromosiClient(nik) {
  try {
    _autoCheckSheets();
    const sheetUsulan = getDb().getSheetByName(TABEL_USULAN_PROMOSI);
    const dataUsulan = sheetUsulan.getDataRange().getValues();
    if (dataUsulan.length <= 1) return JSON.stringify({ error: true, message: "Data usulan kosong." });

    const normHdrU = dataUsulan[0].map(normalizeHeader);
    const nikIdx = normHdrU.indexOf("nik");
    if (nikIdx === -1) return JSON.stringify({ error: true, message: "Kolom NIK tidak ditemukan di USULAN_PROMOSI_MUTASI." });

    const targetNik = String(nik || "").trim();
    for (let i = dataUsulan.length - 1; i >= 1; i--) {
      if (String(dataUsulan[i][nikIdx] || "").trim() === targetNik) {
        sheetUsulan.deleteRow(i + 1);
        return JSON.stringify({ success: true, message: "Usulan promosi/mutasi berhasil ditolak." });
      }
    }

    return JSON.stringify({ error: true, message: "Usulan tidak ditemukan." });
  } catch(e) { return JSON.stringify({ error: true, message: e.toString() }); }
}


// ==========================================
// API: KEHADIRAN (DAILY ACTIVITY)
// ==========================================

function getKehadiranDataClient() {
  try {
    const ss = getDb();
    const sheetRaw = ss.getSheetByName(TABEL_KEHADIRAN);
    const sheetEmp = ss.getSheetByName(TABEL_DB);
    
    if (!sheetRaw || !sheetEmp) return JSON.stringify([]);

    const empHeaders = sheetEmp.getLastColumn() > 0
      ? sheetEmp.getRange(1, 1, 1, sheetEmp.getLastColumn()).getValues()[0]
      : [];
    const empRows = _readDataRowsFromRow2(sheetEmp);
    if (empHeaders.length === 0 || empRows.length === 0) return JSON.stringify([]);

    const normEmpHeaders = empHeaders.map(normalizeHeader);
    const empNikIdx = _findHeaderIndexByCandidates(normEmpHeaders, ["nik", "n_nik", "nomor_induk"]);
    const empNamaIdx = _findHeaderIndexByCandidates(normEmpHeaders, ["nama_karyawan", "nama", "nama_lengkap"]);
    const empUnit2Idx = _findHeaderIndexByCandidates(normEmpHeaders, ["unit_2"]);
    const empUnit3Idx = _findHeaderIndexByCandidates(normEmpHeaders, ["unit_3"]);
    const empUnitIdx = _findHeaderIndexByCandidates(normEmpHeaders, ["nama_unit", "unit", "divisi"]);
    const empPosIdx = _findHeaderIndexByCandidates(normEmpHeaders, ["nama_posisi", "jabatan", "posisi"]);
    const empGenderIdx = _findHeaderIndexByCandidates(normEmpHeaders, ["jenis_kelamin", "gender", "kelamin"]);

    const area3List = [
      "SERVICE OPERATION",
      "ASSET INVENTORY & DATA GOVERNANCE",
      "PERFORMANCE & SHARED SERVICE",
      "ENGINEERING &DEPLOYMENT JATIM&BALI NUSRA",
      "NETWORK OPERATION JATIM & BALI NUSRA",
      "SALES SUPPORT JATIM & BALI NUSRA",
      "ENGINEERING & DEPLOYMENT JATENG & DIY",
      "NETWORK OPERATION JATENG & DIY",
      "SALES SUPPORT JATENG & DIY",
      "EVP AREA 3"
    ].map(s => s.replace(/\s+/g, '').toUpperCase());

    const employeeMap = new Map();
    for (let i = 0; i < empRows.length; i++) {
      const row = empRows[i];
      const nikVal = empNikIdx !== -1 ? _normalizeNikValue(row[empNikIdx]) : "";
      if (!nikVal) continue;

      let unit2Val = empUnit2Idx !== -1 ? String(row[empUnit2Idx] || "").trim() : "";
      let unit3Val = empUnit3Idx !== -1 ? String(row[empUnit3Idx] || "").trim() : "";
      let posVal = empPosIdx !== -1 ? String(row[empPosIdx] || "").trim() : "";
      
      let finalUnit = unit2Val || unit3Val || posVal;
      if (!finalUnit && empUnitIdx !== -1) {
        finalUnit = String(row[empUnitIdx] || "").trim();
      }

      let normalizedUnit = finalUnit.replace(/\s+/g, '').toUpperCase();
      if (area3List.includes(normalizedUnit)) {
        finalUnit = "AREA 3";
      }

      employeeMap.set(nikVal, {
        nik: nikVal,
        nama_karyawan: empNamaIdx !== -1 ? String(row[empNamaIdx] || "").trim() : "",
        nama_unit: finalUnit,
        nama_posisi: posVal,
        jenis_kelamin: empGenderIdx !== -1 ? String(row[empGenderIdx] || "").trim() : ""
      });
    }

    const rawHeaders = sheetRaw.getLastColumn() > 0
      ? sheetRaw.getRange(1, 1, 1, sheetRaw.getLastColumn()).getValues()[0]
      : [];
    const rows = _readDataRowsFromRow2(sheetRaw);
    if (rows.length === 0 || rawHeaders.length === 0) return JSON.stringify([]);
    
    const normRawHeaders = rawHeaders.map(normalizeHeader);
    
    let result = [];
    rows.forEach((row, rowIndex) => {
      let obj = {};
      normRawHeaders.forEach((h, i) => {
        let val = row[i];
        if (val instanceof Date) {
          // Gunakan Utilities.formatDate agar timezone konsisten dengan WIB
          val = Utilities.formatDate(val, PENSIUN_TIMEZONE, "yyyy-MM-dd");
        }
        obj[h] = val;
      });
      
      let nik = _normalizeNikValue(obj.nik || obj.n_nik || obj.nomor_induk || "");
      
      // Bangun tanggal aktivitas dengan prioritas: n_bulan sebagai kebenaran mutlak
      let tanggalAktivitas = _normalizeActivityDateValue(
        obj.tanggal || obj.waktu || obj.date || obj.last_update || obj.hari_create
      );

      // Koreksi swap bulan/hari menggunakan n_bulan (field eksplisit dari sheet)
      // Google Sheets kadang salah baca "5/6/26" sebagai Juni 5 (D/M/Y) padahal M/D/Y = Mei 6
      const nBulanRaw = parseInt(obj.n_bulan || obj.bulan || "");
      if (tanggalAktivitas && !isNaN(nBulanRaw) && nBulanRaw >= 1 && nBulanRaw <= 12) {
        const dp = tanggalAktivitas.split('-');
        if (dp.length === 3) {
          const cYear = parseInt(dp[0]), cMonth = parseInt(dp[1]), cDay = parseInt(dp[2]);
          // Jika bulan hasil parse ≠ n_bulan, tapi hari hasil parse = n_bulan → swap (keduanya ≤ 12)
          if (cMonth !== nBulanRaw && cDay === nBulanRaw && cDay >= 1 && cDay <= 12) {
            tanggalAktivitas = `${cYear}-${String(nBulanRaw).padStart(2,'0')}-${String(cMonth).padStart(2,'0')}`;
          }
        }
      }
      let statusAktif = obj.status_pengajuan || obj.daily_activity || obj.status || "Belum Mengajukan";
      let statusCuti = obj.status_cuti || obj.cuti || "-";
      
      const masterEmp = employeeMap.get(nik);
      if (nik && masterEmp && tanggalAktivitas) {
         result.push({
           row_index: rowIndex + 2, 
           tanggal: tanggalAktivitas,
           nik: masterEmp.nik || nik,
           nama_karyawan: masterEmp.nama_karyawan || obj.nama_karyawan || obj.v_nama_karyawan || obj.nama || "",
           unit_kerja: masterEmp.nama_unit || "",
           nama_unit: masterEmp.nama_unit || "",
           nama_posisi: masterEmp.nama_posisi || "",
           jenis_kelamin: masterEmp.jenis_kelamin || "",
           status: statusAktif,
           cuti: statusCuti
         });
      }
    });
    
    return JSON.stringify(result);
  } catch(e) { return JSON.stringify({ error: true, message: e.toString() }); }
}

function saveKehadiranClient(dataObj) {
  try {
    const ss = getDb();
    const sheetRaw = ss.getSheetByName(TABEL_KEHADIRAN);
    
    const dataRaw = sheetRaw.getDataRange().getValues();
    const normHeaders = dataRaw[0].map(normalizeHeader);

    // Cek kolom status yang mungkin ada
    let idxStatus = normHeaders.indexOf("status_pengajuan");
    if(idxStatus === -1) idxStatus = normHeaders.indexOf("daily_activity");
    if(idxStatus === -1) idxStatus = normHeaders.indexOf("status");

    // Jika Edit by Row Index
    if (dataObj.row_index && dataObj.row_index !== -1 && idxStatus !== -1) {
       sheetRaw.getRange(dataObj.row_index, idxStatus + 1).setValue(dataObj.status);
       return JSON.stringify({success: true});
    }
    
    // Tambah Baru
    let newRow = normHeaders.map(h => {
        if (h === "tanggal" || h === "waktu") return dataObj.tanggal;
        if (h === "nik" || h === "n_nik") return dataObj.nik;
        if (h === "nama" || h === "nama_karyawan" || h === "v_nama_karyawan") return dataObj.nama_karyawan;
        if (h === "unit" || h === "unit_kerja" || h === "v_witel") return dataObj.unit_kerja;
        if (h === "status_pengajuan" || h === "daily_activity" || h === "status") return dataObj.status;
        if (h === "last_update") return _normalizeActivityDateValue(dataObj.tanggal) || dataObj.tanggal;
        return "";
    });
    sheetRaw.appendRow(newRow);
    return JSON.stringify({success: true});
    
  } catch(e) { return JSON.stringify({error: true, message: e.toString()}); }
}

// Helper untuk bulkImportKehadiranClient
// Normalisasi NIK: strip desimal excel (.0) dan leading zeros
function _normNikImport(val) {
  let s = String(val == null ? "" : val).trim();
  s = s.replace(/\.0+$/g, ""); // hapus ".0" dari excel
  s = s.replace(/^0+/, "");    // hapus leading zeros
  return s;
}

// Bangun tanggal YYYY-MM-DD dari kolom n_tahun, n_bulan, hari_create / tanggal
// Frontend XLSX menggunakan { raw: false, dateNF: 'yyyy-mm-dd' } sehingga semua nilai sudah string
function _buildActivityDate(obj) {
  const tahun  = String(obj["n_tahun"]    || obj["tahun"]  || "").trim();
  const bulan  = String(obj["n_bulan"]    || obj["bulan"]  || "").trim();
  // hari_create bisa berupa tanggal penuh "2026-06-07" / "07/06/2026" atau angka hari saja "7"
  const hariRaw = String(obj["hari_create"] || obj["tanggal"] || obj["date"] || obj["waktu"] || obj["last_update"] || "").trim();

  // Coba parse hariRaw sebagai tanggal penuh terlebih dahulu
  if (hariRaw) {
    // Format YYYY-MM-DD atau YYYY/MM/DD
    const ymdM = hariRaw.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/);
    if (ymdM) return `${ymdM[1]}-${ymdM[2].padStart(2,"0")}-${ymdM[3].padStart(2,"0")}`;

    // Format M/D/YY atau M/D/YYYY (Google Sheets: Bulan/Hari/Tahun)
    const mdyM = hariRaw.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})/);
    if (mdyM) {
      const y = mdyM[3].length === 2 ? (parseInt(mdyM[3]) <= 50 ? "20"+mdyM[3] : "19"+mdyM[3]) : mdyM[3];
      const month = parseInt(mdyM[1], 10);  // p1 = BULAN
      const day   = parseInt(mdyM[2], 10);  // p2 = HARI
      // Fallback: jika p1 > 12 pasti hari, bukan bulan → swap
      if (month > 12) {
        return `${y}-${String(day).padStart(2,"0")}-${String(month).padStart(2,"0")}`;
      }
      return `${y}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    }
  }

  // Jika punya tahun + bulan, coba gabungkan dengan hari atau gunakan tanggal 1
  if (tahun && bulan) {
    const tInt = parseInt(tahun);
    const bInt = parseInt(bulan);
    if (!isNaN(tInt) && !isNaN(bInt)) {
      // Cek apakah hariRaw adalah angka hari saja (1-31)
      const hariNum = parseInt(hariRaw);
      const hariStr = (!isNaN(hariNum) && hariNum >= 1 && hariNum <= 31) ? String(hariNum) : "1";
      return `${tInt}-${String(bInt).padStart(2,"0")}-${hariStr.padStart(2,"0")}`;
    }
  }

  // Fallback: coba langsung normalise apapun yang ada
  return _normalizeActivityDateValue(hariRaw) || "";
}

function bulkImportKehadiranClient(dataArray) {
  try {
    _autoCheckSheets();
    const ss = getDb();
    const sheetRaw = ss.getSheetByName(TABEL_KEHADIRAN);
    const sheetMaster = ss.getSheetByName(TABEL_DB);

    if (!dataArray || dataArray.length === 0) return JSON.stringify({error: true, message: "Data kosong"});

    // 1. Baca DB_KARYAWAN — bangun daftar NIK valid DAN urutan baris master
    const masterData = sheetMaster.getDataRange().getValues();
    if (masterData.length <= 1) return JSON.stringify({error: true, message: "DB_KARYAWAN kosong."});

    const masterHeaders = masterData[0].map(normalizeHeader);
    const masterNikIdx  = masterHeaders.indexOf("nik");
    if (masterNikIdx === -1) return JSON.stringify({error: true, message: "Kolom NIK tidak ditemukan di DB_KARYAWAN."});

    // Urutan NIK sesuai DB_KARYAWAN (atas ke bawah)
    const masterNikOrder = [];
    const validNikSet    = new Set();
    for (let i = 1; i < masterData.length; i++) {
      const nk = _normNikImport(String(masterData[i][masterNikIdx]));
      if (nk) { masterNikOrder.push(nk); validNikSet.add(nk); }
    }

    // 2. Normalisasi data dari Excel, index by normalized NIK
    const excelByNik = new Map(); // normNIK -> array of records

    dataArray.forEach(function(rawObj) {
      var obj = {};
      for (var key in rawObj) { obj[normalizeHeader(key)] = rawObj[key]; }

      var nik = _normNikImport(_getObjectValueByCandidates(obj, ["n_nik", "nik", "nomor_induk"]));
      if (!nik || !validNikSet.has(nik)) return; // filter: hanya NIK di DB_KARYAWAN

      var tanggal = _buildActivityDate(obj);
      if (!tanggal) return; // filter: baris tanpa tanggal valid

      var nama   = _getObjectValueByCandidates(obj, ["v_nama_karyawan", "nama_karyawan", "nama", "nama_lengkap"]);
      var status = _getObjectValueByCandidates(obj, ["status_pengajuan", "daily_activity", "status"]);
      var cuti   = _getObjectValueByCandidates(obj, ["status_cuti", "cuti"]);

      if (!excelByNik.has(nik)) excelByNik.set(nik, []);
      excelByNik.get(nik).push({ tanggal: tanggal, nik: nik, nama: nama, status: status, cuti: cuti, raw: obj });
    });

    // 3. Persiapkan header sheet target
    var rawData = sheetRaw.getDataRange().getValues();
    var rawHeaders;

    if (rawData.length === 0 || rawData[0].length === 0 || rawData[0][0] === "") {
      // Jika sheet kosong, langsung gunakan header asli bawaan dari file Excel yang diunggah
      rawHeaders = Object.keys(dataArray[0] || {});
      if (rawHeaders.length > 0) {
        sheetRaw.getRange(1, 1, 1, rawHeaders.length).setValues([rawHeaders]);
      }
    } else {
      rawHeaders = rawData[0];
    }
    var normHeaders = rawHeaders.map(normalizeHeader);

    // 4. Susun baris OUTPUT sesuai urutan DB_KARYAWAN
    var newRows  = [];
    var seenNiks = new Set();

    masterNikOrder.forEach(function(normNik) {
      if (seenNiks.has(normNik)) return;
      seenNiks.add(normNik);

      var records = excelByNik.get(normNik);
      if (!records || records.length === 0) return;

      records.forEach(function(rec) {
        var rowData = normHeaders.map(function(h) {
          let val = (rec.raw && rec.raw[h] !== undefined) ? rec.raw[h] : "";
          // Cegah Google Sheets memutarbalikkan tanggal (auto-parse sesuai region lokal)
          // dengan memaksanya menjadi Plain Text menggunakan awalan petik (')
          if (typeof val === 'string' && /^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(val)) {
             return "'" + val;
          }
          return val;
        });
        newRows.push(rowData);
      });
    });

    var ignoredCount = dataArray.length - newRows.length;

    if (newRows.length > 0) {
      sheetRaw.getRange(sheetRaw.getLastRow() + 1, 1, newRows.length, rawHeaders.length).setValues(newRows);
    }

    var msg = "Berhasil import & filter " + newRows.length + " data (urutan sesuai DB Karyawan).";
    if (ignoredCount > 0) {
      msg += "\n(" + ignoredCount + " baris diabaikan: NIK tidak terdaftar atau tanggal tidak valid)";
    }
    return JSON.stringify({ success: true, message: msg });
  } catch(e) { return JSON.stringify({ error: true, message: e.toString() }); }
}

// ==========================================
// API: MAGANG — SINKRONISASI DUA SPREADSHEET
// ==========================================

/**
 * Helper: Pastikan sheet DB_MAGANG ada di spreadsheet utama
 */
function _ensureMagangSheet() {
  const ss = getDb();
  return _ensureSheetHeaders(ss, TABEL_MAGANG, MAGANG_HEADERS, "#0f172a");
}

/**
 * Helper: Ambil spreadsheet eksternal magang
 */
function _getMagangExternal() {
  try {
    return SpreadsheetApp.openById(MAGANG_EXTERNAL_ID);
  } catch(e) {
    throw new Error("Gagal membuka spreadsheet eksternal magang: " + e.message);
  }
}

/**
 * Helper: Sinkronisasi ONE-WAY: Form Responses 1 (eksternal) → DB_MAGANG (internal)
 * Tidak ada push dari internal ke eksternal — Form Responses dibiarkan apa adanya.
 */
// (Fungsi _syncMagangToExternal dihapus: arah sync hanya dari eksternal ke internal)

/**
 * GET: Ambil semua data magang dari sheet internal DB_MAGANG
 * Fungsi ini dipanggil dari frontend sebagai getMagangDataClient()
 */
function getMagangDataClient() {
  return getMagangClient();
}

function getMagangClient() {
  try {
    const sheet = _ensureMagangSheet();
    const rawHeaders = sheet.getLastColumn() > 0
      ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
      : [];
    const dataRows = _readDataRowsFromRow2(sheet);
    if (rawHeaders.length === 0 || dataRows.length === 0) return JSON.stringify([]);

    const normHeaders = rawHeaders.map(normalizeHeader);
    const idIdx = normHeaders.indexOf("id_magang");
    const namaIdx = normHeaders.indexOf("nama");

    return JSON.stringify(
      dataRows
        .filter(row => {
          return (idIdx !== -1 && row[idIdx] && String(row[idIdx]).trim() !== "") ||
                 (namaIdx !== -1 && row[namaIdx] && String(row[namaIdx]).trim() !== "");
        })
        .map(row => {
          let obj = {};
          normHeaders.forEach((h, i) => {
            let v = row[i];
            if (v instanceof Date) {
              v = Utilities.formatDate(v, PENSIUN_TIMEZONE, "yyyy-MM-dd");
            }
            obj[h] = v;
          });
          obj.asal_kampus = obj.asal_kampus || obj.universitas || "";
          obj.unit_tujuan = obj.unit_tujuan || obj.divisi || obj.penempatan_unit_divisi || "";
          obj.nomor_hp = obj.nomor_hp || obj.no_hp || obj.telepon || "";
          return obj;
        })
    );
  } catch(e) { return JSON.stringify({ error: true, message: e.toString() }); }
}

/**
 * ADD: Tambah data magang baru ke DB_MAGANG (internal) + sync ke eksternal
 * Dipanggil dari frontend sebagai saveMagangClient()
 */
function saveMagangClient(dataObj) {
  return addMagangClient(dataObj);
}

function addMagangClient(dataObj) {
  try {
    const sheet = _ensureMagangSheet();
    const normHeaders = MAGANG_HEADERS.map(normalizeHeader);
    const timeNow = new Date().toISOString();

    // Normalisasi alias dari frontend
    if (dataObj.asal_kampus !== undefined && dataObj.universitas === undefined) {
      dataObj.universitas = dataObj.asal_kampus;
    }
    if (dataObj.no_telepon !== undefined && dataObj.nomor_hp === undefined) {
      dataObj.nomor_hp = dataObj.no_telepon;
    }

    // Gunakan id_magang atau generate otomatis
    if (!dataObj.id_magang) {
      dataObj.id_magang = "MGG-" + Math.floor(100000 + Math.random() * 900000);
    }

    // Cek duplikasi id_magang
    const existing = sheet.getDataRange().getValues();
    const idIdx = normHeaders.indexOf("id_magang");
    for (let i = 1; i < existing.length; i++) {
      if (String(existing[i][idIdx] || "").trim() === String(dataObj.id_magang || "").trim()) {
        return JSON.stringify({ error: true, message: "ID Magang " + dataObj.id_magang + " sudah terdaftar." });
      }
    }

    const lastRow = sheet.getLastRow();
    const newRow = MAGANG_HEADERS.map(h => {
      const nk = normalizeHeader(h);
      if (nk === "no") return lastRow;
      if (nk === "created_at" || nk === "updated_at") return timeNow;
        if (nk === "timestamp" && (!dataObj.timestamp)) return Utilities.formatDate(new Date(), PENSIUN_TIMEZONE, "dd/MM/yyyy");
      return dataObj[nk] !== undefined ? dataObj[nk] : "";
    });

    sheet.appendRow(newRow);
    _renumberNoColumn(sheet, normHeaders);

    // Hanya simpan ke internal — tidak push ke eksternal
    return JSON.stringify({ success: true, message: "Data magang berhasil ditambahkan ke DB_MAGANG." });
  } catch(e) { return JSON.stringify({ error: true, message: e.toString() }); }
}

/**
 * UPDATE: Edit data magang di DB_MAGANG (internal) + sync ke eksternal
 * Primary key: id_magang
 */
function updateMagangClient(dataObj) {
  try {
    const sheet = _ensureMagangSheet();
    const data = sheet.getDataRange().getValues();
    const normHeaders = data[0].map(normalizeHeader);
    const idIdx = normHeaders.indexOf("id_magang");
    if (idIdx === -1) return JSON.stringify({ error: true, message: "Kolom id_magang tidak ditemukan di DB_MAGANG." });

    if (dataObj.asal_kampus !== undefined && dataObj.universitas === undefined) {
      dataObj.universitas = dataObj.asal_kampus;
    }
    if (dataObj.no_telepon !== undefined && dataObj.nomor_hp === undefined) {
      dataObj.nomor_hp = dataObj.no_telepon;
    }

    const idMagang = String(dataObj.id_magang || "").trim();
    if (!idMagang) return JSON.stringify({ error: true, message: "id_magang wajib diisi untuk update." });

    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idIdx] || "").trim() === idMagang) { rowIndex = i + 1; break; }
    }
    if (rowIndex === -1) {
      return addMagangClient(dataObj);
    }

    dataObj["updated_at"] = new Date().toISOString();

    const updatedRow = normHeaders.map((h, idx) => {
      if (h === "no") return data[rowIndex - 1][idx];
      if (h === "created_at") return data[rowIndex - 1][idx];
      return dataObj[h] !== undefined ? dataObj[h] : data[rowIndex - 1][idx];
    });

    sheet.getRange(rowIndex, 1, 1, normHeaders.length).setValues([updatedRow]);

    // Hanya simpan ke internal — tidak push ke eksternal (Form Responses dibiarkan apa adanya)
    return JSON.stringify({ success: true, message: "Data magang berhasil diperbarui di DB_MAGANG." });
  } catch(e) { return JSON.stringify({ error: true, message: e.toString() }); }
}

/**
 * DELETE: Hapus data magang dari DB_MAGANG internal (berdasarkan id_magang)
 */
function deleteMagangClient(idMagang) {
  try {
    const sheet = _ensureMagangSheet();
    const data = sheet.getDataRange().getValues();
    const normHeaders = data[0].map(normalizeHeader);
    const idIdx = normHeaders.indexOf("id_magang");
    if (idIdx === -1) return JSON.stringify({ error: true, message: "Kolom id_magang tidak ditemukan." });

    const targetId = String(idMagang || "").trim();
    let deleted = false;
    for (let i = data.length - 1; i >= 1; i--) {
      if (String(data[i][idIdx] || "").trim() === targetId) {
        sheet.deleteRow(i + 1);
        deleted = true;
      }
    }
    if (!deleted) return JSON.stringify({ error: true, message: "ID Magang " + targetId + " tidak ditemukan di DB_MAGANG." });
    _renumberNoColumn(sheet, normHeaders);
    return JSON.stringify({ success: true, message: "Data magang berhasil dihapus dari DB_MAGANG internal." });
  } catch(e) { return JSON.stringify({ error: true, message: e.toString() }); }
}

/**
 * BULK IMPORT: Upload CSV magang dari frontend → DB_MAGANG internal + sync ke eksternal
 * Dipanggil dari frontend sebagai bulkImportMagangClient()
 */
function bulkImportMagangClient(dataArray) {
  try {
    if (!dataArray || dataArray.length === 0) return JSON.stringify({ error: true, message: "Data kosong." });
    const sheet = _ensureMagangSheet();
    const normHeaders = MAGANG_HEADERS.map(normalizeHeader);
    const timeNow = new Date().toISOString();

    // Build ID map dari existing data
    const existing = sheet.getDataRange().getValues();
    const idIdx = normHeaders.indexOf("id_magang");
    const idRowMap = {};
    for (let i = 1; i < existing.length; i++) {
      const cellId = String(existing[i][idIdx] || "").trim();
      if (cellId) idRowMap[cellId] = i + 1;
    }

    let inserted = 0, updated = 0;
    dataArray.forEach(rawObj => {
      let obj = {};
      for (let key in rawObj) { obj[normalizeHeader(key)] = rawObj[key]; }

      if (obj.asal_kampus !== undefined && obj.universitas === undefined) {
        obj.universitas = obj.asal_kampus;
      }
      if (obj.no_telepon !== undefined && obj.nomor_hp === undefined) {
        obj.nomor_hp = obj.no_telepon;
      }

      if (!obj.id_magang) obj.id_magang = "MGG-" + Math.floor(100000 + Math.random() * 900000);
      obj["updated_at"] = timeNow;

      const idMagang = String(obj.id_magang || "").trim();

      if (idMagang && idRowMap[idMagang]) {
        // Update internal only
        const rowIdx = idRowMap[idMagang];
        const currentRow = existing[rowIdx - 1];
        const updRow = normHeaders.map((h, i) => {
          if (h === "no" || h === "created_at") return currentRow[i];
          return obj[h] !== undefined && obj[h] !== "" ? obj[h] : currentRow[i];
        });
        sheet.getRange(rowIdx, 1, 1, normHeaders.length).setValues([updRow]);
        updated++;
      } else {
        // Tambah baru ke internal only
        const lastRow = sheet.getLastRow();
        const newRow = MAGANG_HEADERS.map(h => {
          const nk = normalizeHeader(h);
          if (nk === "no") return lastRow;
          if (nk === "created_at" || nk === "updated_at") return timeNow;
          return obj[nk] !== undefined ? obj[nk] : "";
        });
        sheet.appendRow(newRow);
        inserted++;
      }
    });

    _renumberNoColumn(sheet, normHeaders);
    return JSON.stringify({
      success: true,
      message: `${inserted} data baru ditambahkan, ${updated} data diperbarui di DB_MAGANG.`
    });
  } catch(e) { return JSON.stringify({ error: true, message: e.toString() }); }
}

/**
 * PULL SYNC (dipanggil dari frontend): Tarik data baru dari Form Responses 1 → DB_MAGANG
 * Arah: eksternal (Form Responses 1) → internal (DB_MAGANG)
 * - Jika id_magang/timestamp sudah ada di internal → update kolom dari Form (jaga kolom tambahan)
 * - Jika belum ada → tambah sebagai baris baru
 * Form Responses 1 tidak dimodifikasi sama sekali.
 */
function pullMagangFromExternalClient() {
  return pullMagangFromExternal();
}

function pullMagangFromExternal() {
  try {
    const extSs = _getMagangExternal();
    const extSheet = extSs.getSheetByName(MAGANG_EXTERNAL_SHEET);
    if (!extSheet) throw new Error("Sheet '" + MAGANG_EXTERNAL_SHEET + "' tidak ditemukan di spreadsheet eksternal.");

    const extHeaders = extSheet.getLastColumn() > 0
      ? extSheet.getRange(1, 1, 1, extSheet.getLastColumn()).getValues()[0]
      : [];
    const extDataRows = _readDataRowsFromRow2(extSheet);
    if (extHeaders.length === 0 || extDataRows.length === 0) {
      return JSON.stringify({ success: true, message: "Tidak ada data di spreadsheet eksternal." });
    }

    const extNormHeaders = extHeaders.map(normalizeHeader);

    // Balik mapping: header internal → header eksternal asli → index kolom eksternal
    // Contoh: "nama" → "Nama Peserta" → index 3
    const internalToExtColIdx = {};
    Object.keys(MAGANG_EXTERNAL_MAP).forEach(internalKey => {
      const extHeaderName = MAGANG_EXTERNAL_MAP[internalKey];
      const colIdx = extHeaders.findIndex(h => h === extHeaderName);
      if (colIdx !== -1) internalToExtColIdx[internalKey] = colIdx;
    });

    // Ambil sheet internal
    const sheet = _ensureMagangSheet();
    const intHeaders = sheet.getLastColumn() > 0
      ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
      : [];
    const intDataRows = _readDataRowsFromRow2(sheet);
    if (intHeaders.length === 0) throw new Error("Header DB_MAGANG tidak ditemukan.");
    const normHdr = intHeaders.map(normalizeHeader);
    const idIdx = normHdr.indexOf("id_magang");
    const tsIdx = normHdr.indexOf("timestamp"); // fallback key jika id_magang kosong di form

    // Build lookup map dari DB_MAGANG internal
    const idRowMap = {}; // id_magang → row number (1-indexed)
    const tsRowMap = {}; // timestamp → row number (fallback)
    for (let i = 0; i < intDataRows.length; i++) {
      const cellId = idIdx !== -1 ? String(intDataRows[i][idIdx] || "").trim() : "";
      const cellTs = tsIdx !== -1 ? String(intDataRows[i][tsIdx] || "").trim() : "";
      if (cellId) idRowMap[cellId] = i + 2;
      if (cellTs && !tsRowMap[cellTs]) tsRowMap[cellTs] = i + 2;
    }

    let pulled = 0, updated = 0;
    const timeNow = new Date().toISOString();

    extDataRows.forEach(extRow => {
      // Baca semua kolom dari baris form eksternal
      let obj = {};
      Object.keys(internalToExtColIdx).forEach(internalKey => {
        const colIdx = internalToExtColIdx[internalKey];
        let val = extRow[colIdx];
        if (val instanceof Date) val = Utilities.formatDate(val, PENSIUN_TIMEZONE, "yyyy-MM-dd");
        obj[internalKey] = val;
      });

      // Bersihkan: skip baris kosong
      const namaVal = String(obj.nama || "").trim();
      const tsVal = String(obj.timestamp || "").trim();
      if (!namaVal && !tsVal) return;

      // Gunakan timestamp sebagai pengenal dari form (karena form biasanya tidak punya ID)
      // id_magang di internal di-generate jika tidak ada dari form
      const idMagangFromForm = String(obj.id_magang || "").trim();

      // Cari apakah sudah ada di internal
      let rowIndex = -1;
      if (idMagangFromForm && idRowMap[idMagangFromForm]) {
        rowIndex = idRowMap[idMagangFromForm];
      } else if (tsVal && tsRowMap[tsVal]) {
        rowIndex = tsRowMap[tsVal];
      }

      if (rowIndex !== -1) {
        // UPDATE: baris sudah ada di internal — update kolom-kolom dari form saja
        // Kolom tambahan internal (surat_dinas_mentor, keterangan_selesai, dll) TIDAK ditimpa jika kosong dari form
        const currentRow = intDataRows[rowIndex - 2];
        obj["updated_at"] = timeNow;
        const updRow = normHdr.map((h, idx) => {
          if (h === "no" || h === "created_at") return currentRow[idx]; // jangan ubah
          const newVal = obj[h];
          // Jika kolom ini tidak ada di form (tidak di MAGANG_EXTERNAL_MAP), jaga nilai lama
          if (!(h in internalToExtColIdx) && h !== "updated_at") return currentRow[idx];
          // Jika nilai baru kosong tapi lama tidak kosong, jaga nilai lama
          if ((newVal === undefined || newVal === "") && currentRow[idx] !== "") return currentRow[idx];
          return newVal !== undefined ? newVal : currentRow[idx];
        });
        sheet.getRange(rowIndex, 1, 1, normHdr.length).setValues([updRow]);
        intDataRows[rowIndex - 2] = updRow; // update cache lokal
        updated++;
      } else {
        // INSERT: baris baru dari form — generate id_magang jika perlu
        if (!obj.id_magang) obj.id_magang = "FORM-" + Math.floor(100000 + Math.random() * 900000);
        obj["created_at"] = timeNow;
        obj["updated_at"] = timeNow;
        const lastRow = sheet.getLastRow();
        const newRow = MAGANG_HEADERS.map(h => {
          const nk = normalizeHeader(h);
          if (nk === "no") return lastRow;
          return obj[nk] !== undefined ? obj[nk] : "";
        });
        sheet.appendRow(newRow);
        idRowMap[obj.id_magang] = sheet.getLastRow(); // update cache
        if (obj.timestamp) tsRowMap[String(obj.timestamp).trim()] = sheet.getLastRow();
        pulled++;
      }
    });

    _renumberNoColumn(sheet, normHdr);
    return JSON.stringify({
      success: true,
      message: `Sinkronisasi selesai: ${pulled} data baru dari Form ditambahkan, ${updated} data diperbarui di DB_MAGANG.`
    });
  } catch(e) { return JSON.stringify({ error: true, message: e.toString() }); }
}

/**
 * Buat trigger otomatis: pull dari Form Responses setiap 1 jam
 * Jalankan SEKALI dari Google Apps Script Editor → pilih fungsi setupMagangSyncTrigger → Run
 */
/**
 * Sync magang dijalankan MANUAL dari Apps Script Editor atau dari tombol di web app.
 * Untuk menjalankan: panggil pullMagangFromExternalClient() dari frontend,
 * atau jalankan pullMagangFromExternal() langsung dari Apps Script Editor.
 * Tidak ada trigger otomatis — sinkronisasi dilakukan atas permintaan pengguna.
 */
