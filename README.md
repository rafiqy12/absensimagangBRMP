# Sistem Presensi Anak Magang (Live Camera Selfie & Geolocation)

Aplikasi presensi modern untuk anak magang yang dibangun dengan **React + Vite** di sisi frontend dan **PHP + SQLite** di sisi backend.

Sistem ini memastikan validitas kehadiran dengan mewajibkan **foto selfie yang diambil langsung secara live** melalui kamera perangkat (anti-upload galeri) serta mencatat **titik lokasi GPS (Geolocation)** secara otomatis saat presensi dilakukan.

---

## ✨ Fitur Utama

1. **Login Menggunakan NIM**:
   - Otentikasi sederhana berbasis NIM.
   - Tersedia tombol cepat untuk akun demo (contoh: NIM `2024001` - Budi, `2024002` - Siti).
   - Fitur pendaftaran magang baru bagi mahasiswa yang belum terdaftar.

2. **Kamera Live Selfie (Anti-Upload Galeri)**:
   - Tidak ada opsi unggah file dari galeri / disk untuk mencegah kecurangan absensi.
   - Menggunakan WebRTC (`getUserMedia`) untuk streaming kamera perangkat secara *real-time*.
   - Dilengkapi panduan oval wajah (*face guide overlay*) dan tombol jepret foto selfie langsung.
   - Fitur ambil ulang (*retake*) sebelum konfirmasi pengiriman.

3. **Deteksi Lokasi GPS Otomatis (Geolocation)**:
   - Mencatat koordinat Latitude dan Longitude secara akurat saat presensi.
   - Integrasi tombol **"Buka di Maps"** yang langsung menghubungkan ke Google Maps pada halaman riwayat.

4. **Validasi Presensi**:
   - Tombol kirim presensi otomatis terkunci sampai foto selfie langsung dan lokasi GPS berhasil diperoleh.
   - Pilihan tipe kehadiran: **Presensi Masuk** atau **Presensi Pulang**.
   - Input catatan atau rencana kegiatan harian.

5. **Riwayat & Rekap Kehadiran**:
   - Tab riwayat kehadiran pribadi anak magang.
   - Tab rekap untuk pembimbing / admin memantau seluruh anak magang.
   - Modal popup untuk memperbesar foto selfie verifikasi.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Lucide React (Modern Icons), Vanilla CSS (Plus Jakarta Sans).
- **Backend**: PHP 8.x (RESTful API).
- **Database**: SQLite PDO (Zero configuration, otomatis terinisialisasi).
- **Environment**: Laragon / Apache / PHP Built-in Server.

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Menggunakan Laragon (Direkomendasikan)
1. Letakkan folder ini di `C:\laragon\www\` atau `D:\laragon\www\`.
2. Nyalakan Laragon (**Start All**).
3. Buka browser dan kunjungi:
   ```
   http://localhost/absensi-anak-magang/
   ```

### 2. Menggunakan PHP Built-in Server
```bash
php -S 127.0.0.1:8000
```
Lalu buka browser di `http://127.0.0.1:8000`.

### 3. Pengembangan Frontend (Opsional / Development Mode)
```bash
cd frontend
npm install
npm run dev
```
Untuk memperbarui build produksi:
```bash
npm run build
```

---

## 👥 Akun Demo Siap Pakai

| NIM | Nama | Divisi | Kampus |
| :--- | :--- | :--- | :--- |
| `2024001` | Budi Santoso | Software Engineer | Universitas Indonesia |
| `2024002` | Siti Rahmawati | UI/UX Designer | Institut Teknologi Bandung |
| `2024003` | Rizky Pratama | Digital Marketing | Universitas Gadjah Mada |
| `2024004` | Putri Ayu Lestari | Content Creator | Politeknik Negeri Jakarta |
