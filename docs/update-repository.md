# Update Repository Guide

Panduan ini digunakan untuk menambahkan file baru dan memperbarui repository GitHub.

## 1. Clone Repository

```bash
git clone https://github.com/rizkiwahyuu/Employee-Management.git
cd Employee-Management
```

Jika repository sudah ada di laptop:

```bash
git pull origin main
```

## 2. Salin File Tambahan

Salin file berikut ke root repository:

```text
README.md
appsscript.json
.gitignore
.claspignore
.clasp.json.example
SECURITY.md
CHANGELOG.md
docs/database-schema.md
docs/deployment-guide.md
docs/security-checklist.md
docs/update-repository.md
patches/Code.gs.properties-refactor.md
```

## 3. Cek Status Git

```bash
git status
```

## 4. Tambahkan File

```bash
git add README.md appsscript.json .gitignore .claspignore .clasp.json.example SECURITY.md CHANGELOG.md docs/ patches/
```

Atau jika semua file sudah aman:

```bash
git add .
```

## 5. Commit

```bash
git commit -m "Add documentation and Apps Script project files"
```

## 6. Push

```bash
git push origin main
```

## 7. Cek di GitHub

Pastikan file berikut tampil di repository:

1. `README.md` tampil sebagai halaman utama repo.
2. `appsscript.json` ada di root project.
3. `docs/` berisi panduan deployment dan schema database.
4. `SECURITY.md` berisi catatan keamanan.

## 8. Catatan Penting

Jika repository public, jangan upload file spreadsheet berisi data asli pegawai. Ganti dengan template kosong atau data dummy.
