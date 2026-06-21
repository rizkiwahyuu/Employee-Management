# Security Policy

## Data yang Tidak Boleh Dipublikasikan

Jangan commit data berikut ke repository public:

1. NIK pegawai.
2. Email internal perusahaan.
3. Nomor HP.
4. Link dokumen Google Drive yang tidak public.
5. ID Google Spreadsheet aktif.
6. Data kinerja, kompetensi, behavior, promosi, mutasi, pensiun, dan magang.
7. File database asli yang berisi data pegawai.

## Konfigurasi Sensitif

Simpan konfigurasi berikut di Script Properties, bukan di source code:

| Key | Isi |
|---|---|
| MAIN_DB_ID | ID spreadsheet utama |
| MAGANG_EXTERNAL_ID | ID spreadsheet form magang eksternal |
| MAGANG_EXTERNAL_SHEET | Nama sheet form magang eksternal |

## Rekomendasi Akses Web App

Gunakan pengaturan akses sesuai kebutuhan internal.

| Kondisi | Akses yang Disarankan |
|---|---|
| Pengujian pribadi | Only myself |
| Demo terbatas | Anyone with Google account |
| Internal perusahaan | Sesuai domain atau link terbatas |
| Repo public | Jangan gunakan database asli |

## Checklist Sebelum Push

- [ ] Hapus ID spreadsheet aktif dari source code.
- [ ] Hapus data pegawai asli dari file contoh.
- [ ] Hapus link Google Drive privat.
- [ ] Pastikan `.clasp.json` tidak ikut ter-commit.
- [ ] Pastikan file database asli tidak ikut ter-commit.
- [ ] Gunakan data dummy untuk demo public.

## Pelaporan Masalah

Jika ada data sensitif yang terlanjur masuk ke repository:

1. Jadikan repo private sementara.
2. Hapus file atau data sensitif.
3. Rotate akses spreadsheet atau ubah permission.
4. Bersihkan riwayat Git jika data sensitif sudah masuk commit history.
5. Deploy ulang Apps Script jika diperlukan.
