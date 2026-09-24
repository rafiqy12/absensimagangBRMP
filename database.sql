-- =========================================================
-- Database SQL Dump for Presensi Magang BRMP
-- Generated at: 2026-09-24 00:59:27
-- =========================================================

PRAGMA foreign_keys = OFF;

-- ---------------------------------------------------------
-- Table structure for `students`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `students`;
CREATE TABLE students (
        nim VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        institution VARCHAR(150) DEFAULT 'Universitas / Sekolah',
        division VARCHAR(100) DEFAULT 'Umum',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    , supervisor VARCHAR(150) DEFAULT 'Pembimbing Magang', status VARCHAR(20) DEFAULT 'Aktif');

-- Dumping data for table `students`
INSERT INTO `students` (`nim`, `name`, `institution`, `division`, `created_at`, `supervisor`, `status`) VALUES ('2024001', 'Budi Santoso', 'IPB University', 'Standardisasi & Pengujian Mutu', '2026-09-22 08:33:43', 'Pembimbing Magang', 'Aktif');
INSERT INTO `students` (`nim`, `name`, `institution`, `division`, `created_at`, `supervisor`, `status`) VALUES ('2024002', 'Siti Rahmawati', 'Universitas Gadjah Mada', 'Laboratorium Benih & Instrumen', '2026-09-22 08:33:43', 'Pembimbing Magang', 'Aktif');
INSERT INTO `students` (`nim`, `name`, `institution`, `division`, `created_at`, `supervisor`, `status`) VALUES ('2024003', 'Rizky Pratama', 'Institut Teknologi Bandung', 'Teknologi Informasi & Data', '2026-09-22 08:33:43', 'Pembimbing Magang', 'Aktif');
INSERT INTO `students` (`nim`, `name`, `institution`, `division`, `created_at`, `supervisor`, `status`) VALUES ('2024004', 'Putri Ayu Lestari', 'Politeknik Pembangunan Pertanian (Polbangtan)', 'Diseminasi Standar Pertanian', '2026-09-22 08:33:43', 'Pembimbing Magang', 'Aktif');
INSERT INTO `students` (`nim`, `name`, `institution`, `division`, `created_at`, `supervisor`, `status`) VALUES ('231011401234', 'Raka Aditya', 'PT Nusantara Digital', 'UI/UX Design', '2026-09-23 03:56:39', 'Dian Pratiwi', 'Aktif');
INSERT INTO `students` (`nim`, `name`, `institution`, `division`, `created_at`, `supervisor`, `status`) VALUES ('231011401235', 'Siti Nurhaliza', 'Dinas Kominfo', 'Frontend Development', '2026-09-23 03:56:39', 'Fajar Maulana', 'Aktif');
INSERT INTO `students` (`nim`, `name`, `institution`, `division`, `created_at`, `supervisor`, `status`) VALUES ('231011401236', 'Bagas Pratama', 'Bank Jateng', 'Data Analytics', '2026-09-23 03:56:39', 'Rina Kusuma', 'Aktif');
INSERT INTO `students` (`nim`, `name`, `institution`, `division`, `created_at`, `supervisor`, `status`) VALUES ('231011401237', 'Alya Ramadhani', 'Suara Merdeka', 'Content & Media', '2026-09-23 03:56:39', 'Yoga Prasetyo', 'Aktif');
INSERT INTO `students` (`nim`, `name`, `institution`, `division`, `created_at`, `supervisor`, `status`) VALUES ('231011401238', 'Dimas Saputra', 'Nusantara Tech', 'Backend Development', '2026-09-23 03:56:39', 'Arif Wibowo', 'Nonaktif');
INSERT INTO `students` (`nim`, `name`, `institution`, `division`, `created_at`, `supervisor`, `status`) VALUES ('123456789', 'fadli', 'PT Nusantara Digital', 'UI/UX Intern', '2026-09-23 07:31:10', 'Dian Pratiwi', 'Aktif');
INSERT INTO `students` (`nim`, `name`, `institution`, `division`, `created_at`, `supervisor`, `status`) VALUES ('123', 'tes', 'PT Nusantara Digital', 'UI/UX Intern', '2026-09-23 08:06:30', 'Dian Pratiwi', 'Aktif');

-- ---------------------------------------------------------
-- Table structure for `attendances`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `attendances`;
CREATE TABLE attendances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_nim VARCHAR(50) NOT NULL,
        type VARCHAR(20) NOT NULL, -- 'masuk' atau 'pulang'
        photo_path VARCHAR(255) NOT NULL,
        latitude REAL,
        longitude REAL,
        location_name TEXT,
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP, office_id INTEGER, distance_meters REAL, status VARCHAR(30) DEFAULT 'Terverifikasi', work_duration VARCHAR(50),
        FOREIGN KEY (student_nim) REFERENCES students(nim) ON DELETE CASCADE
    );

-- Dumping data for table `attendances`
INSERT INTO `attendances` (`id`, `student_nim`, `type`, `photo_path`, `latitude`, `longitude`, `location_name`, `note`, `created_at`, `office_id`, `distance_meters`, `status`, `work_duration`) VALUES ('1', '231011401234', 'masuk', 'uploads/demo_raka_masuk.jpg', '-6.9842', '110.4091', 'Kantor Pusat · Gedung A', 'Presensi pagi tepat waktu', '2026-09-23 08:02:15', '1', '18', 'Terverifikasi', NULL);
INSERT INTO `attendances` (`id`, `student_nim`, `type`, `photo_path`, `latitude`, `longitude`, `location_name`, `note`, `created_at`, `office_id`, `distance_meters`, `status`, `work_duration`) VALUES ('2', '231011401235', 'masuk', 'uploads/demo_siti_masuk.jpg', '-6.9842', '110.4091', 'Kantor Pusat · Gedung A', 'Presensi masuk lancar', '2026-09-23 07:56:40', '1', '24', 'Terverifikasi', NULL);
INSERT INTO `attendances` (`id`, `student_nim`, `type`, `photo_path`, `latitude`, `longitude`, `location_name`, `note`, `created_at`, `office_id`, `distance_meters`, `status`, `work_duration`) VALUES ('3', '231011401236', 'masuk', 'uploads/demo_bagas_masuk.jpg', '-6.9925', '110.4208', 'Gedung B · Balai Inovasi', 'Terlambat karena kendala lalu lintas', '2026-09-23 08:17:20', '2', '31', 'Terlambat', NULL);
INSERT INTO `attendances` (`id`, `student_nim`, `type`, `photo_path`, `latitude`, `longitude`, `location_name`, `note`, `created_at`, `office_id`, `distance_meters`, `status`, `work_duration`) VALUES ('4', '231011401237', 'masuk', 'uploads/demo_alya_masuk.jpg', '-6.9842', '110.4091', 'Kantor Pusat · Gedung A', 'Wajah sedikit buram saat capture', '2026-09-23 08:05:08', '1', '12', 'Perlu tinjauan', NULL);
INSERT INTO `attendances` (`id`, `student_nim`, `type`, `photo_path`, `latitude`, `longitude`, `location_name`, `note`, `created_at`, `office_id`, `distance_meters`, `status`, `work_duration`) VALUES ('5', '2024001', 'masuk', 'uploads/selfie_2024001_20260923_115955_5e159e.jpg', '-6.9842', '110.4091', 'Kantor Pusat · Gedung A', 'Presensi masuk mandiri melalui aplikasi Hadirin', '2026-09-23 11:59:55', '1', '0', 'Terlambat', NULL);
INSERT INTO `attendances` (`id`, `student_nim`, `type`, `photo_path`, `latitude`, `longitude`, `location_name`, `note`, `created_at`, `office_id`, `distance_meters`, `status`, `work_duration`) VALUES ('6', '2024001', 'pulang', 'uploads/selfie_2024001_20260923_120012_9c284a.jpg', '-6.9842', '110.4091', 'Kantor Pusat · Gedung A', 'Presensi pulang mandiri melalui aplikasi Hadirin', '2026-09-23 12:00:12', '1', '0', 'Terverifikasi', '0 jam 0 menit');
INSERT INTO `attendances` (`id`, `student_nim`, `type`, `photo_path`, `latitude`, `longitude`, `location_name`, `note`, `created_at`, `office_id`, `distance_meters`, `status`, `work_duration`) VALUES ('7', '231011401235', 'pulang', 'uploads/selfie_231011401235_20260923_122011_7a0f4a.jpg', '-7.7514601491209', '110.42647095276', 'Gedung B · Balai Inovasi', 'Presensi pulang mandiri melalui aplikasi Hadirin', '2026-09-23 12:20:11', '2', '84394.8', 'Perlu tinjauan', '4 jam 23 menit');
INSERT INTO `attendances` (`id`, `student_nim`, `type`, `photo_path`, `latitude`, `longitude`, `location_name`, `note`, `created_at`, `office_id`, `distance_meters`, `status`, `work_duration`) VALUES ('8', '231011401236', 'pulang', 'uploads/selfie_231011401236_20260923_122612_65cc56.jpg', '-7.7514650549619', '110.42647798304', 'Gedung B · Balai Inovasi', 'Presensi pulang mandiri melalui aplikasi Hadirin', '2026-09-23 12:26:12', '2', '84395.4', 'Perlu tinjauan', '4 jam 8 menit');
INSERT INTO `attendances` (`id`, `student_nim`, `type`, `photo_path`, `latitude`, `longitude`, `location_name`, `note`, `created_at`, `office_id`, `distance_meters`, `status`, `work_duration`) VALUES ('10', '123456789', 'masuk', 'uploads/selfie_123456789_20260923_143151_32d551.jpg', '-7.7514713285413', '110.42647198185', 'Gedung B · Balai Inovasi', 'Presensi masuk mandiri dengan verifikasi deteksi wajah', '2026-09-23 14:31:51', '2', '84396.1', 'Perlu tinjauan', NULL);
INSERT INTO `attendances` (`id`, `student_nim`, `type`, `photo_path`, `latitude`, `longitude`, `location_name`, `note`, `created_at`, `office_id`, `distance_meters`, `status`, `work_duration`) VALUES ('11', '123456789', 'pulang', 'uploads/selfie_123456789_20260923_143242_b7ebec.jpg', '-7.7514607351964', '110.42647776388', 'Gedung B · Balai Inovasi', 'Presensi pulang mandiri dengan verifikasi deteksi wajah', '2026-09-23 14:32:42', '2', '84394.9', 'Terverifikasi', '0 jam 0 menit');
INSERT INTO `attendances` (`id`, `student_nim`, `type`, `photo_path`, `latitude`, `longitude`, `location_name`, `note`, `created_at`, `office_id`, `distance_meters`, `status`, `work_duration`) VALUES ('12', '123', 'masuk', 'uploads/selfie_123_20260924_074222_a30981.jpg', '-7.7514577366516', '110.42647867786', 'Kantor Pusat · Gedung A', 'Presensi masuk mandiri dengan verifikasi deteksi wajah', '2026-09-24 07:42:22', '1', '0.3', 'Terverifikasi', NULL);

-- ---------------------------------------------------------
-- Table structure for `admins`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `admins`;
CREATE TABLE admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(150) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Administrator',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

-- Dumping data for table `admins`
INSERT INTO `admins` (`id`, `username`, `email`, `name`, `password`, `role`, `created_at`) VALUES ('1', 'admin', 'nadia.putri@hadirin.id', 'Nadia Putri', '$2y$10$pjms8GSlwhLs4nXpveNgieZIOrWXrYDtbYM6qS6TFHVNPY5bkM2gO', 'Administrator', '2026-09-23 03:56:39');

-- ---------------------------------------------------------
-- Table structure for `office_locations`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `office_locations`;
CREATE TABLE office_locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(150) NOT NULL,
        address TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        radius_meters INTEGER DEFAULT 150,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

-- Dumping data for table `office_locations`
INSERT INTO `office_locations` (`id`, `name`, `address`, `latitude`, `longitude`, `radius_meters`, `is_active`, `created_at`) VALUES ('1', 'Kantor Pusat · Gedung A', 'Lokasi Kantor Pusat', '-7.75146', '110.42648', '150', '1', '2026-09-23 03:56:39');
INSERT INTO `office_locations` (`id`, `name`, `address`, `latitude`, `longitude`, `radius_meters`, `is_active`, `created_at`) VALUES ('2', 'Gedung B · Balai Inovasi', 'Jl. Pahlawan No. 45, Semarang', '-6.9925', '110.4208', '150', '1', '2026-09-23 03:56:39');
INSERT INTO `office_locations` (`id`, `name`, `address`, `latitude`, `longitude`, `radius_meters`, `is_active`, `created_at`) VALUES ('3', 'Gedung C · Laboratorium & Riset', 'Jl. Imam Bonjol No. 88, Semarang', '-6.975', '110.412', '200', '1', '2026-09-23 03:56:39');

-- ---------------------------------------------------------
-- Table structure for `logbooks`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `logbooks`;
CREATE TABLE logbooks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_nim VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        duration_minutes INTEGER DEFAULT 450, -- default ~7.5 jam
        date DATE NOT NULL,
        attachment_count INTEGER DEFAULT 0,
        status VARCHAR(30) DEFAULT 'Draft', -- 'Draft', 'Terkirim', 'Disetujui', 'Revisi'
        admin_feedback TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_nim) REFERENCES students(nim) ON DELETE CASCADE
    );

-- Dumping data for table `logbooks`
INSERT INTO `logbooks` (`id`, `student_nim`, `title`, `description`, `duration_minutes`, `date`, `attachment_count`, `status`, `admin_feedback`, `created_at`) VALUES ('1', '231011401234', 'Riset pola navigasi aplikasi', 'Menganalisis alur pengguna dan menyusun rekomendasi struktur navigasi untuk sistem mobile presensi.', '450', '2026-09-23', '2', 'Disetujui', 'Aktivitas logbook telah diperiksa dan disetujui.', '2026-09-23 03:56:39');
INSERT INTO `logbooks` (`id`, `student_nim`, `title`, `description`, `duration_minutes`, `date`, `attachment_count`, `status`, `admin_feedback`, `created_at`) VALUES ('2', '231011401235', 'Implementasi halaman profil', 'Membangun komponen profil responsif dan integrasi endpoint pengguna dengan verifikasi token.', '480', '2026-09-22', '1', 'Revisi', 'perbaiki isi kegiatan loogbok hari ini saja', '2026-09-23 03:56:39');
INSERT INTO `logbooks` (`id`, `student_nim`, `title`, `description`, `duration_minutes`, `date`, `attachment_count`, `status`, `admin_feedback`, `created_at`) VALUES ('3', '231011401236', 'Pembersihan data survei', 'Validasi data duplikat dan normalisasi format tanggapan responden dari kuisioner lapangan.', '405', '2026-09-21', '0', 'Revisi', 'Mohon sertakan visualisasi grafik distribusi sebelum dan sesudah normalisasi.', '2026-09-23 03:56:39');
INSERT INTO `logbooks` (`id`, `student_nim`, `title`, `description`, `duration_minutes`, `date`, `attachment_count`, `status`, `admin_feedback`, `created_at`) VALUES ('4', '231011401237', 'Kalender konten Oktober', 'Menyusun tema mingguan dan draf caption kanal media sosial beserta aset visual pendukung.', '420', '2026-09-20', '3', 'Disetujui', 'Bagus sekali, teruskan penjadwalan publish konten.', '2026-09-23 03:56:39');
INSERT INTO `logbooks` (`id`, `student_nim`, `title`, `description`, `duration_minutes`, `date`, `attachment_count`, `status`, `admin_feedback`, `created_at`) VALUES ('5', '123', 'membuat presensi', 'membuat aplikasi', '0', '2026-09-24', '0', 'Disetujui', 'Aktivitas logbook telah diperiksa dan disetujui.', '2026-09-24 00:50:32');

-- ---------------------------------------------------------
-- Table structure for `settings`
-- ---------------------------------------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT
    );

-- Dumping data for table `settings`
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES ('work_start', '08:00');
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES ('work_end', '17:00');
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES ('late_tolerance', '10');
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES ('auto_mark_late', '1');
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES ('require_photo_in', '1');
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES ('require_photo_out', '1');
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES ('save_location', '1');
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES ('app_name', 'Hadirin');
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES ('app_subtitle', 'Sistem Presensi & Logbook Magang');
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES ('require_face_detection', '1');

PRAGMA foreign_keys = ON;
