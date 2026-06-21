# Refactor Catatan Keamanan Code.gs

File `Code.gs` saat ini dapat dibuat lebih aman dengan memindahkan ID spreadsheet ke Script Properties.

## Masalah

Konfigurasi seperti ID database dan ID spreadsheet eksternal sebaiknya tidak ditulis langsung di source code, terutama jika repository public.

## Tambahkan Helper Config

Tambahkan fungsi berikut di bagian atas `Code.gs`.

```javascript
function getScriptConfig(key, fallback) {
  const value = PropertiesService.getScriptProperties().getProperty(key);
  return value || fallback || "";
}
```

## Ubah Konfigurasi Database

Sebelum:

```javascript
const MAIN_DB_ID = "ISI_ID_SPREADSHEET";
const MAGANG_EXTERNAL_ID = "ISI_ID_SPREADSHEET_MAGANG";
const MAGANG_EXTERNAL_SHEET = "Form Responses 1";
```

Sesudah:

```javascript
const MAIN_DB_ID = getScriptConfig("MAIN_DB_ID");
const MAGANG_EXTERNAL_ID = getScriptConfig("MAGANG_EXTERNAL_ID");
const MAGANG_EXTERNAL_SHEET = getScriptConfig("MAGANG_EXTERNAL_SHEET", "Form Responses 1");
```

## Script Properties yang Perlu Diisi

| Key | Value |
|---|---|
| MAIN_DB_ID | ID spreadsheet utama |
| MAGANG_EXTERNAL_ID | ID spreadsheet form magang eksternal |
| MAGANG_EXTERNAL_SHEET | Form Responses 1 |

## Catatan

Setelah refactor ini, aplikasi tidak akan berjalan sebelum Script Properties diisi. Lakukan perubahan ini hanya jika kamu sudah siap mengatur konfigurasi di Google Apps Script.
