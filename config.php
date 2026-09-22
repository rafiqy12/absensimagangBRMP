<?php
// config.php - Konfigurasi Database SQLite & Session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Set zona waktu Indonesia (WIB)
date_default_timezone_set('Asia/Jakarta');

// Direktori data dan upload
$dataDir = __DIR__ . '/data';
$uploadDir = __DIR__ . '/uploads';

if (!is_dir($dataDir)) {
    mkdir($dataDir, 0777, true);
}
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$dbPath = $dataDir . '/database.sqlite';

try {
    $pdo = new PDO("sqlite:" . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Buat tabel anak magang (students)
    $pdo->exec("CREATE TABLE IF NOT EXISTS students (
        nim VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        institution VARCHAR(150) DEFAULT 'Universitas / Sekolah',
        division VARCHAR(100) DEFAULT 'Umum',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Buat tabel presensi (attendances)
    $pdo->exec("CREATE TABLE IF NOT EXISTS attendances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_nim VARCHAR(50) NOT NULL,
        type VARCHAR(20) NOT NULL, -- 'masuk' atau 'pulang'
        photo_path VARCHAR(255) NOT NULL,
        latitude REAL,
        longitude REAL,
        location_name TEXT,
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_nim) REFERENCES students(nim) ON DELETE CASCADE
    )");

    // Seed data contoh jika tabel masih kosong
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM students");
    if ($stmt->fetch()['count'] == 0) {
        $seedStmt = $pdo->prepare("INSERT INTO students (nim, name, institution, division) VALUES (?, ?, ?, ?)");
        $seeds = [
            ['2024001', 'Budi Santoso', 'IPB University', 'Standardisasi & Pengujian Mutu'],
            ['2024002', 'Siti Rahmawati', 'Universitas Gadjah Mada', 'Laboratorium Benih & Instrumen'],
            ['2024003', 'Rizky Pratama', 'Institut Teknologi Bandung', 'Teknologi Informasi & Data'],
            ['2024004', 'Putri Ayu Lestari', 'Politeknik Pembangunan Pertanian (Polbangtan)', 'Diseminasi Standar Pertanian'],
        ];
        foreach ($seeds as $s) {
            $seedStmt->execute($s);
        }
    }
} catch (PDOException $e) {
    die("Koneksi database gagal: " . $e->getMessage());
}

// Helper: Format tanggal Indonesia
function formatTanggalIndo($datetime) {
    $days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    $months = [
        1 => 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    $timestamp = strtotime($datetime);
    $dayName = $days[date('w', $timestamp)];
    $day = date('d', $timestamp);
    $month = $months[(int)date('m', $timestamp)];
    $year = date('Y', $timestamp);
    $time = date('H:i', $timestamp);

    return "$dayName, $day $month $year - $time WIB";
}

// Helper: Cek login
function checkAuth() {
    if (!isset($_SESSION['nim'])) {
        header("Location: index.php");
        exit;
    }
}
