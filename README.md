# Area 3 TIF Employee Management

<p align="center">
  <img src="https://i.ibb.co.com/27N5K98Y/Infranexia-Primary-2-1.png" alt="Infranexia Logo" width="260" />
</p>

<p align="center">
  <b>Web Application by Google Apps Script</b><br>
  Sistem manajemen data karyawan untuk Area 3 TIF PT Telkom Infrastruktur Indonesia.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Google%20Apps%20Script-4285F4?style=for-the-badge&logo=googleappsscript&logoColor=white" alt="Google Apps Script" />
  <img src="https://img.shields.io/badge/Database-Google%20Sheets-34A853?style=for-the-badge&logo=googlesheets&logoColor=white" alt="Google Sheets" />
  <img src="https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=for-the-badge&logo=react&logoColor=111827" alt="React" />
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

## Ringkasan Project

**Area 3 TIF Employee Management** adalah aplikasi web untuk membantu pengelolaan administrasi Sumber Daya Manusia secara terpusat. Sistem ini menghubungkan dashboard analitik, master data pegawai, promosi dan mutasi, aktivitas harian, pensiun, dan manajemen peserta magang dalam satu platform berbasis Google Apps Script.

Project ini dibuat untuk mengurangi proses manual pada pencatatan dan pelaporan data pegawai. Admin dapat memantau kondisi pegawai, melakukan filter data, memperbarui data, mengekspor laporan, serta melihat informasi strategis secara cepat melalui dashboard visual.

Aplikasi ini menggunakan **Google Sheets sebagai database**, **Google Apps Script sebagai backend**, dan **React berbasis CDN sebagai frontend**. Pendekatan ini membuat sistem lebih ringan, mudah diakses melalui browser, dan sesuai untuk kebutuhan internal yang membutuhkan integrasi langsung dengan spreadsheet.

## Link Aplikasi

Aplikasi dapat diakses melalui Google Apps Script Web App berikut:

[Area 3 TIF Employee Management Web App](https://script.google.com/macros/s/AKfycbzrDg7GDR_kskcscMsaozgAJToGNvjyJFlGhU0YfOTxYriQZ0HGGV1X41m0QOAR2RMMYQ/exec)

> Catatan: akses aplikasi mengikuti pengaturan deployment Google Apps Script dan izin akun yang digunakan.

## Tujuan Pengembangan

Project ini dikembangkan untuk mendukung kebutuhan operasional HR dan manajemen Area 3 TIF melalui beberapa tujuan utama:

1. **Sentralisasi Data Pegawai**
   
   Menyatukan data profil, unit kerja, jabatan, lokasi, status pegawai, pendidikan, dan riwayat kerja ke dalam satu database utama.

2. **Monitoring SDM Berbasis Dashboard**
   
   Menampilkan metrik utama seperti total pegawai, demografi gender, rata-rata usia, distribusi band posisi, sebaran daerah, pendidikan, generasi, dan tren rekrutmen.

3. **Efisiensi Administrasi**
   
   Mengurangi pekerjaan manual melalui fitur impor data, ekspor Excel, edit data, sinkronisasi spreadsheet, dan rekapitulasi otomatis.

4. **Dukungan Keputusan Promosi dan Mutasi**
   
   Membantu proses analisis kandidat berdasarkan band posisi, masa kerja, nilai kinerja, kompetensi, behavior, dan talent cluster.

5. **Perencanaan Pensiun dan Suksesi**
   
   Menyediakan pemantauan pegawai yang mendekati masa pensiun melalui daftar pensiun, countdown, usulan pensiun, dan riwayat persetujuan.

6. **Pengelolaan Peserta Magang**
   
   Mencatat data peserta magang, dokumen pendukung, periode magang, mentor, unit tujuan, status, surat dinas, dan sertifikat.

## Fitur Utama

### 1. Analytics Dashboard

Dashboard menjadi halaman utama untuk melihat kondisi SDM secara ringkas dan visual. Modul ini menampilkan data agregat dari database aktif.

Fitur pada dashboard:

- Total pegawai terdaftar.
- Jumlah pegawai pria dan wanita.
- Rata-rata usia pegawai.
- Distribusi pegawai berdasarkan Band Posisi atau BP.
- Sebaran daerah berdasarkan kota atau gedung.
- Tren rekrutmen tahunan.
- Demografi generasi.
- Tingkat pendidikan pegawai.
- Proyeksi tren pensiun 10 tahun ke depan.
- Tren kepatuhan Daily Activity selama 7 hari terakhir.
- Top 5 pegawai dengan waktu pensiun terdekat.

### 2. Employee Master

Employee Master berfungsi sebagai pusat data utama pegawai. Admin dapat melihat seluruh data pegawai dalam bentuk tabel yang dapat difilter.

Fitur pada Employee Master:

- Tabel data pegawai aktif.
- Pencarian berdasarkan nama atau NIK.
- Filter berdasarkan Band Posisi.
- Filter berdasarkan Unit Kerja.
- Detail informasi jabatan dan unit.
- Edit data karyawan melalui modal form.
- Ekspor data ke Excel.
- Impor data dari file spreadsheet.
- Sinkronisasi data dengan Google Sheets.

### 3. Promotion & Transfer

Modul ini membantu admin melakukan analisis dan pengajuan promosi atau mutasi pegawai.

Fitur pada Promotion & Transfer:

- Daftar pegawai dengan status kelayakan promosi atau mutasi.
- Filter hanya pegawai yang lolos syarat.
- Filter berdasarkan Band, Unit Kerja, nilai P, nilai K, nilai B, dan Talent Cluster.
- Analisis masa kerja pada band posisi.
- Form pengajuan promosi atau mutasi.
- Riwayat usulan promosi dan mutasi.
- Persetujuan dan penolakan usulan.
- Ekspor hasil analisis ke Excel.

### 4. Daily Activity

Daily Activity digunakan untuk memantau kepatuhan aktivitas harian pegawai.

Fitur pada Daily Activity:

- Daftar status aktivitas harian pegawai.
- Rekap pegawai yang telah mengisi aktivitas.
- Rekap pegawai cuti atau izin.
- Rekap pegawai yang belum mengisi aktivitas.
- Filter tanggal, divisi, unit, dan status.
- Rekapitulasi per divisi.
- Upload data Daily Activity dari file CSV atau Excel.
- Ekspor rekap ke Excel.
- Unduh tampilan rekap sebagai gambar menggunakan html2canvas.

### 5. Retirement Management

Retirement Management membantu admin memantau pegawai yang mendekati masa pensiun.

Fitur pada Retirement Management:

- Daftar pegawai berdasarkan tanggal pensiun.
- Countdown sisa masa kerja.
- Kategori status pensiun.
- Pengajuan pensiun ke sheet usulan.
- Riwayat usulan pensiun.
- Persetujuan usulan pensiun.
- Penolakan usulan pensiun.
- Pemindahan data pegawai ke database pensiun setelah disetujui.
- Ekspor laporan pensiun ke Excel.

### 6. Internship Management

Internship Management digunakan untuk mencatat dan mengelola peserta magang.

Fitur pada Internship Management:

- Daftar peserta magang.
- Tambah data peserta magang.
- Edit data peserta magang.
- Hapus data peserta magang.
- Upload data peserta magang dari CSV atau Excel.
- Sinkronisasi data dari Google Form eksternal.
- Monitoring status magang.
- Penyimpanan link proposal, CV, surat pengantar, surat dinas mentor, keterangan selesai, dan sertifikat.

## Alur Sistem

```text
User / Admin
    |
    v
Google Apps Script Web App
    |
    |-- index.html
    |-- styles.html
    |-- scripts.html
    |
    v
Code.gs Backend API
    |
    v
Google Sheets Database
    |
    |-- DB_KARYAWAN
    |-- DB_DAILY ACTIVITY RAW
    |-- DB_CUTI
    |-- DB_PENSIUN
    |-- USULAN_PENSIUN
    |-- USULAN_PROMOSI_MUTASI
    |-- MUTASI
    |-- DB_MAGANG
```

## Tech Stack

| Bagian | Teknologi | Fungsi |
|---|---|---|
| Backend | Google Apps Script | API, koneksi database, proses CRUD, sinkronisasi data |
| Database | Google Sheets | Penyimpanan data pegawai, daily activity, pensiun, usulan, dan magang |
| Frontend | HTML, React 18, Babel Standalone | Antarmuka aplikasi berbasis komponen |
| Styling | Tailwind CSS, Custom CSS | Layout, warna, responsivitas, modal, animasi |
| Chart | Chart.js, Chart.js DataLabels | Visualisasi dashboard dan grafik analitik |
| Export | SheetJS XLSX | Ekspor dan impor data Excel |
| Capture | html2canvas | Mengunduh tampilan rekap sebagai gambar |
| Icon | Boxicons | Ikon navigasi dan komponen UI |
| Runtime | V8 | Runtime JavaScript Google Apps Script |

## Struktur Repository

```text
Employee-Management/
├── Code.gs
├── index.html
├── styles.html
├── scripts.html
├── appsscript.json
├── README.md
├── SECURITY.md
├── CHANGELOG.md
├── .gitignore
├── .claspignore
├── .clasp.json.example
├── docs/
│   ├── database-schema.md
│   ├── deployment-guide.md
│   ├── security-checklist.md
│   └── update-repository.md
├── patches/
│   └── Code.gs.properties-refactor.md
└── GUIDE BOOK.pdf
```

## Penjelasan File

| File | Keterangan |
|---|---|
| `Code.gs` | Backend utama Google Apps Script untuk membaca, menulis, mengubah, menghapus, dan menyinkronkan data. |
| `index.html` | Entry point aplikasi web dan konfigurasi library frontend. |
| `styles.html` | Styling tambahan untuk body, scrollbar, preloader, modal, animasi, dan toolbar. |
| `scripts.html` | Frontend React untuk dashboard, tabel, form, modal, chart, upload, ekspor, dan navigasi. |
| `appsscript.json` | Manifest Google Apps Script. |
| `README.md` | Dokumentasi utama repository. |
| `SECURITY.md` | Panduan keamanan data dan konfigurasi. |
| `CHANGELOG.md` | Catatan perubahan project. |
| `.gitignore` | Daftar file lokal yang tidak perlu masuk Git. |
| `.claspignore` | Daftar file yang tidak perlu di-push ke Google Apps Script melalui clasp. |
| `.clasp.json.example` | Contoh konfigurasi clasp tanpa ID project asli. |
| `docs/database-schema.md` | Dokumentasi struktur database. |
| `docs/deployment-guide.md` | Panduan deployment Google Apps Script. |
| `docs/security-checklist.md` | Checklist keamanan sebelum repo dipublikasikan. |
| `docs/update-repository.md` | Panduan update repository GitHub. |
| `patches/Code.gs.properties-refactor.md` | Panduan refactor agar ID spreadsheet disimpan di Script Properties. |
| `GUIDE BOOK.pdf` | Buku panduan penggunaan aplikasi. |

## Struktur Database

Aplikasi membutuhkan beberapa sheet di Google Sheets.

| Sheet | Fungsi |
|---|---|
| `DB_KARYAWAN` | Master data pegawai aktif. |
| `DB_CUTI` | Data cuti dan izin pegawai. |
| `DB_DAILY ACTIVITY RAW` | Data aktivitas harian pegawai. |
| `DB_PENSIUN` | Database pegawai yang sudah masuk proses pensiun atau purna tugas. |
| `USULAN_PENSIUN` | Data usulan pensiun yang menunggu persetujuan. |
| `USULAN_PROMOSI_MUTASI` | Data usulan promosi atau mutasi yang menunggu persetujuan. |
| `MUTASI` | Riwayat mutasi pegawai. |
| `DB_MAGANG` | Data peserta magang internal. |

Detail kolom dapat dilihat pada file `docs/database-schema.md`.

## Cara Menjalankan Project

### 1. Siapkan Google Sheets

Buat atau gunakan spreadsheet internal yang memiliki sheet sesuai struktur database.

Minimal sheet yang diperlukan:

```text
DB_KARYAWAN
DB_CUTI
DB_DAILY ACTIVITY RAW
DB_PENSIUN
USULAN_PENSIUN
USULAN_PROMOSI_MUTASI
MUTASI
DB_MAGANG
```

### 2. Buat Project Google Apps Script

1. Buka Google Apps Script.
2. Buat project baru.
3. Tambahkan file berikut:
   - `Code.gs`
   - `index.html`
   - `styles.html`
   - `scripts.html`
   - `appsscript.json`
4. Pastikan nama file sama persis.
5. Aktifkan runtime V8.
6. Atur timezone ke `Asia/Jakarta`.

### 3. Atur Script Properties

Agar data sensitif tidak ditulis langsung di source code, gunakan Script Properties.

Rekomendasi key:

| Key | Keterangan |
|---|---|
| `MAIN_DB_ID` | ID spreadsheet utama. |
| `MAGANG_EXTERNAL_ID` | ID spreadsheet Google Form magang eksternal. |
| `MAGANG_EXTERNAL_SHEET` | Nama sheet response form magang. |

Contoh helper Apps Script:

```javascript
function getConfig(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}
```

### 4. Deploy Web App

Gunakan konfigurasi berikut:

| Opsi | Nilai |
|---|---|
| Deployment type | Web app |
| Execute as | Me |
| Who has access | Anyone with the link atau sesuai kebijakan internal |
| Runtime | V8 |
| Time zone | Asia/Jakarta |

Setelah deploy, salin URL Web App dan tambahkan ke bagian **Link Aplikasi** pada README.

## Cara Update Repository GitHub

Clone repository:

```bash
git clone https://github.com/rizkiwahyuu/Employee-Management.git
cd Employee-Management
```

Tarik perubahan terbaru:

```bash
git pull origin main
```

Tambahkan perubahan:

```bash
git status
git add .
git commit -m "Update README and project documentation"
git push origin main
```

## Rekomendasi Commit

```bash
git add README.md
git commit -m "Improve README documentation with app link and project details"
git push origin main
```

## Catatan Keamanan

Karena project ini berkaitan dengan data pegawai, perhatikan hal berikut sebelum repository dibuat public:

- Jangan upload database asli pegawai.
- Jangan upload file Excel yang berisi NIK, email internal, nomor HP, atau data personal pegawai.
- Jangan menulis ID spreadsheet aktif langsung di `Code.gs`.
- Jangan menulis URL Google Drive internal yang bersifat privat.
- Gunakan data dummy untuk dokumentasi public.
- Simpan konfigurasi penting di Script Properties.
- Batasi akses Google Sheets hanya untuk akun yang berwenang.
- Pastikan deployment Web App mengikuti kebijakan internal perusahaan.

## Status Project

| Komponen | Status |
|---|---|
| Analytics Dashboard | Selesai |
| Employee Master | Selesai |
| Promotion & Transfer | Selesai |
| Daily Activity | Selesai |
| Retirement Management | Selesai |
| Internship Management | Selesai |
| Dokumentasi Repository | Diperbarui |
| Security Checklist | Disarankan |

## Roadmap Pengembangan

Beberapa pengembangan lanjutan yang dapat ditambahkan:

- Login multi-role untuk Admin, HR, dan Viewer.
- Audit log untuk perubahan data penting.
- Validasi form yang lebih ketat pada input NIK dan tanggal.
- Notifikasi otomatis untuk pegawai mendekati masa pensiun.
- Dashboard khusus rekap mingguan dan bulanan.
- Export PDF untuk laporan HR.
- Backup database otomatis ke folder Google Drive internal.
- Pencatatan histori perubahan jabatan, unit, dan status pegawai.

## Dokumentasi Tambahan

| Dokumen | Keterangan |
|---|---|
| `GUIDE BOOK.pdf` | Panduan penggunaan aplikasi untuk user. |
| `docs/database-schema.md` | Struktur database dan kolom yang dibutuhkan. |
| `docs/deployment-guide.md` | Panduan deploy Google Apps Script. |
| `docs/security-checklist.md` | Checklist keamanan repository. |
| `docs/update-repository.md` | Panduan update GitHub. |
| `SECURITY.md` | Panduan penanganan data sensitif. |

## Author

**Rizki Wahyu Widodo**  
S1 Sains Data  
Universitas Negeri Surabaya

## Acknowledgement

Project ini dikembangkan sebagai bagian dari kebutuhan digitalisasi administrasi SDM di lingkungan Area 3 TIF PT Telkom Infrastruktur Indonesia.

## License

Gunakan lisensi sesuai kebijakan perusahaan atau kampus. Jika repository memuat aset internal, data pegawai, atau dokumen perusahaan, jangan gunakan lisensi open source tanpa persetujuan pihak terkait.
