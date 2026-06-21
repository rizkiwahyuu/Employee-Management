# Security Checklist

Gunakan checklist ini sebelum repository dibagikan atau dibuat public.

## Repository

- [ ] Repository tidak memuat file database asli pegawai.
- [ ] Repository tidak memuat NIK asli pegawai.
- [ ] Repository tidak memuat email internal pegawai.
- [ ] Repository tidak memuat nomor HP peserta magang.
- [ ] Repository tidak memuat link Google Drive privat.
- [ ] Repository tidak memuat ID spreadsheet aktif.
- [ ] File `.clasp.json` tidak ikut ter-commit.
- [ ] File credential dan service account tidak ikut ter-commit.

## Google Sheets

- [ ] Spreadsheet utama hanya dapat diakses pihak berwenang.
- [ ] Spreadsheet form magang memiliki permission yang tepat.
- [ ] Sheet berisi data sensitif tidak dibagikan public.
- [ ] Data dummy dipakai untuk demo public.

## Google Apps Script

- [ ] `appsscript.json` memakai runtime V8.
- [ ] Timezone memakai `Asia/Jakarta`.
- [ ] ID spreadsheet disimpan di Script Properties.
- [ ] Web App access disesuaikan dengan kebutuhan.
- [ ] Deployment lama yang tidak dipakai sudah dicabut.

## Frontend

- [ ] Tidak ada token atau credential di `index.html`.
- [ ] Tidak ada token atau credential di `scripts.html`.
- [ ] CDN yang dipakai jelas dan diperlukan.
- [ ] Pesan error tidak membocorkan data sensitif.

## Sebelum Demo

- [ ] Gunakan data dummy.
- [ ] Pastikan chart dan tabel tampil normal.
- [ ] Pastikan fitur tambah, edit, hapus, impor, dan ekspor sudah diuji.
- [ ] Pastikan link dokumen magang tidak membuka data privat.
