# Deployment Guide

Panduan ini menjelaskan cara menjalankan Area 3 TIF Employee Management di Google Apps Script.

## 1. Persiapan

Siapkan file berikut:

```text
Code.gs
index.html
styles.html
scripts.html
appsscript.json
```

Siapkan juga Google Sheets sebagai database utama dengan sheet berikut:

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

## 2. Membuat Project Google Apps Script

1. Buka Google Drive.
2. Klik `New`.
3. Pilih `More`.
4. Pilih `Google Apps Script`.
5. Ubah nama project menjadi `Area 3 TIF Employee Management`.

## 3. Menambahkan File Project

Buat file dengan nama yang sama persis:

| File | Jenis | Fungsi |
|---|---|---|
| Code.gs | Script | Backend dan API Google Sheets |
| index.html | HTML | Entry point aplikasi |
| styles.html | HTML | Styling custom |
| scripts.html | HTML | Frontend React |
| appsscript.json | Manifest | Konfigurasi Apps Script |

Nama `styles` dan `scripts` harus sama karena dipanggil oleh `include('styles')` dan `include('scripts')` di `index.html`.

## 4. Mengaktifkan Manifest

1. Buka `Project Settings`.
2. Aktifkan `Show appsscript.json manifest file in editor`.
3. Buka file `appsscript.json`.
4. Tempel isi manifest dari repository.

## 5. Mengatur Script Properties

Buka:

```text
Project Settings > Script Properties
```

Tambahkan key berikut:

| Key | Value |
|---|---|
| MAIN_DB_ID | ID spreadsheet utama |
| MAGANG_EXTERNAL_ID | ID spreadsheet form magang eksternal |
| MAGANG_EXTERNAL_SHEET | Form Responses 1 |

Catatan: jika `Code.gs` masih memakai konstanta langsung, pindahkan ID spreadsheet ke Script Properties agar lebih aman.

## 6. Menjalankan Fungsi Awal

Di editor Apps Script:

1. Pilih fungsi `_autoCheckSheets`.
2. Klik `Run`.
3. Izinkan akses yang diminta.
4. Pastikan sheet database terbentuk atau tervalidasi.

## 7. Deploy Web App

1. Klik `Deploy`.
2. Pilih `New deployment`.
3. Klik ikon gear.
4. Pilih `Web app`.
5. Atur opsi:

| Opsi | Nilai |
|---|---|
| Description | Initial deployment |
| Execute as | Me |
| Who has access | Anyone with the link atau sesuai kebijakan internal |

6. Klik `Deploy`.
7. Salin URL Web App.
8. Buka URL di browser.

## 8. Update Setelah Ada Perubahan

Setiap ada perubahan kode:

1. Simpan file di Apps Script.
2. Klik `Deploy`.
3. Pilih `Manage deployments`.
4. Klik ikon edit.
5. Pilih `New version`.
6. Klik `Deploy`.

## 9. Troubleshooting

### Aplikasi hanya loading

Kemungkinan penyebab:

1. CDN React, Tailwind, Chart.js, atau library lain gagal dimuat.
2. `scripts.html` error saat render.
3. Fungsi `getAllDataClient()` gagal mengambil data.
4. Permission spreadsheet belum diberikan.

Solusi:

1. Buka Developer Tools di browser.
2. Cek tab Console.
3. Jalankan fungsi backend langsung dari Apps Script.
4. Cek permission spreadsheet.

### Data tidak muncul

Cek hal berikut:

1. ID spreadsheet benar.
2. Nama sheet sama persis.
3. Header sheet sesuai schema.
4. Web App sudah memakai deployment versi terbaru.

### Error akses spreadsheet

Solusi:

1. Pastikan akun deployer memiliki akses editor ke spreadsheet.
2. Jalankan ulang fungsi backend dari Apps Script untuk memicu authorization.
3. Deploy ulang Web App.

## 10. Catatan Produksi

Untuk pemakaian internal, batasi akses Web App sesuai kebijakan perusahaan. Jangan memakai data asli pada repository public.
