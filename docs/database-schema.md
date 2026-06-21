# Database Schema

Dokumen ini menjelaskan struktur sheet yang digunakan oleh Area 3 TIF Employee Management.

## Ringkasan Sheet

| Sheet | Fungsi | Status |
|---|---|---|
| DB_KARYAWAN | Master data pegawai | Wajib |
| DB_CUTI | Data cuti pegawai | Wajib jika fitur cuti dipakai |
| DB_DAILY ACTIVITY RAW | Data aktivitas harian | Wajib untuk Daily Activity |
| DB_PENSIUN | Data pensiun yang sudah disetujui | Wajib untuk Retirement Management |
| USULAN_PENSIUN | Usulan pensiun sebelum persetujuan | Wajib untuk workflow pensiun |
| USULAN_PROMOSI_MUTASI | Usulan promosi dan mutasi | Wajib untuk Promotion & Transfer |
| MUTASI | Riwayat mutasi | Wajib untuk arsip mutasi |
| DB_MAGANG | Data peserta magang | Wajib untuk Internship Management |

## 1. DB_KARYAWAN

Sheet utama untuk menyimpan data pegawai aktif.

Kolom utama:

```text
no, tahun, bulan, nik, nama_karyawan, jenis_kelamin, nama_agama, usia,
kelompok_usia, tgl_capeg, tgl_pegprus, tgl_mulaikerja, tgl_pensiun,
nama_employee_group, nama_employee_subgroup, kode_personnel_area, kode_host,
kode_function_unit, nama_function_unit, kode_personnel_subarea,
nama_personnel_subarea, tgl_psa, kode_payroll_area, nama_payroll_area,
kode_divisi, tgl_divisi, nama_divisi, kode_unit, tgl_unit, nama_unit,
long_unit, pt_tif, unit 1, unit 2, unit 3, objidposisi, tgl_posisi,
kode_posisi, nama_posisi, long_posisi, lama_posisi, nama_action,
band_posisi, tgl_band_posisi, lama_bandposisi, flag_pj, lama_pj,
tahun_kinerja, nilai_kinerja, tahun_kompetensi, nilai_kompetensi,
tahun_behavior, nilai_behavior, level_pendidikan, group_pendidikan,
jurusan_pendidikan, nama_institusi, kode_perusahaan, nama_perusahaan,
kode_home, nama_home, job_family, job_function, job_role, role_category,
flag_chief, email, kode_gedung, nama_gedung, alamat_gedung, kota_gedung,
CEK, talenct_cluster
```

Kolom penting untuk fitur aplikasi:

| Kolom | Fungsi |
|---|---|
| nik | Kunci unik pegawai |
| nama_karyawan | Nama pegawai |
| jenis_kelamin | Demografi gender |
| usia | Metrik usia dan generasi |
| tgl_mulaikerja | Perhitungan masa kerja |
| tgl_pensiun | Proyeksi pensiun |
| nama_unit | Filter unit kerja |
| nama_posisi | Data jabatan |
| band_posisi | Distribusi band posisi |
| nilai_kinerja | Penilaian kinerja |
| nilai_kompetensi | Penilaian kompetensi |
| nilai_behavior | Penilaian behavior |
| level_pendidikan | Grafik pendidikan |
| kota_gedung | Sebaran daerah |
| email | Kontak pegawai |
| talenct_cluster | Talent mapping |

## 2. DB_CUTI

Sheet untuk data cuti.

```text
ID_CUTI, NIK, NAMA_KARYAWAN, DIVISI, TGL_CUTI, TIPE_CUTI, STATUS, CREATED_AT
```

## 3. DB_DAILY ACTIVITY RAW

Sheet untuk data aktivitas harian pegawai.

Kolom yang umum dipakai:

```text
v_employee_group, v_company_code, v_short_divisi, status_cuti, c_company_code,
keterangan, subdit, last_update, c_host, n_bulan, tanggal, v_nama_karyawan,
v_band_posisi, n_tahun, c_kode_divisi, n_nik, v_witel, v_employee_subgroup,
hari_create, status_pengajuan
```

Kolom penting:

| Kolom | Fungsi |
|---|---|
| tanggal | Tanggal aktivitas |
| n_nik | Relasi ke NIK pegawai |
| v_nama_karyawan | Nama pegawai pada data activity |
| status_pengajuan | Status activity |
| status_cuti | Status cuti atau izin |
| v_band_posisi | Band posisi |
| c_kode_divisi | Kode divisi |

## 4. DB_PENSIUN dan USULAN_PENSIUN

Sheet ini memakai struktur data pegawai dengan tambahan kolom workflow.

```text
STATUS_USULAN, TGL_DIUSULKAN, CATATAN, [kolom DB_KARYAWAN]
```

Keterangan:

| Kolom | Fungsi |
|---|---|
| STATUS_USULAN | Status usulan pensiun |
| TGL_DIUSULKAN | Tanggal pengajuan |
| CATATAN | Catatan admin atau HR |

## 5. USULAN_PROMOSI_MUTASI dan MUTASI

Sheet ini memakai struktur data pegawai dengan tambahan kolom promosi dan mutasi.

```text
STATUS_USULAN, TGL_DIUSULKAN, POSISI_AWAL, POSISI_USULAN, MUTASI, CATATAN, [kolom DB_KARYAWAN]
```

Keterangan:

| Kolom | Fungsi |
|---|---|
| STATUS_USULAN | Status usulan |
| TGL_DIUSULKAN | Tanggal usulan |
| POSISI_AWAL | Posisi sebelum pengajuan |
| POSISI_USULAN | Posisi tujuan |
| MUTASI | Penanda promosi atau mutasi |
| CATATAN | Catatan admin atau HR |

## 6. DB_MAGANG

Sheet untuk data peserta magang.

```text
no, id_magang, timestamp, nama, nomor_hp, email, nim, universitas, jurusan,
tanggal_mulai, tanggal_selesai, durasi, surat_pengantar, proposal, cv,
unit_tujuan, mentor, status, surat_dinas_mentor, keterangan_selesai,
file_sertifikat, CREATED_AT, UPDATED_AT
```

Kolom penting:

| Kolom | Fungsi |
|---|---|
| id_magang | ID unik peserta magang |
| nama | Nama peserta |
| nomor_hp | Kontak peserta |
| email | Email peserta |
| nim | NIM atau nomor identitas akademik |
| universitas | Asal institusi |
| jurusan | Program studi |
| tanggal_mulai | Awal magang |
| tanggal_selesai | Akhir magang |
| durasi | Durasi magang |
| unit_tujuan | Unit penempatan |
| mentor | Pembimbing internal |
| status | Status proses magang |
| file_sertifikat | Link sertifikat |

## Catatan Validasi

1. Header sheet harus sama dengan header yang dipakai di `Code.gs`.
2. Kolom `nik` harus unik di `DB_KARYAWAN`.
3. Kolom tanggal sebaiknya memakai format tanggal yang konsisten.
4. Data demo sebaiknya memakai data dummy.
5. Jangan unggah data pegawai asli ke repository public.
