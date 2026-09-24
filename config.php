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

    // 1. Tabel Mahasiswa Magang (students)
    $pdo->exec("CREATE TABLE IF NOT EXISTS students (
        nim VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        institution VARCHAR(150) DEFAULT 'Universitas / Sekolah',
        division VARCHAR(100) DEFAULT 'Umum',
        supervisor VARCHAR(150) DEFAULT 'Pembimbing Magang',
        status VARCHAR(20) DEFAULT 'Aktif', -- 'Aktif' / 'Nonaktif' / 'Selesai'
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // 2. Tabel Admin (admins)
    $pdo->exec("CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(150) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Administrator',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // 3. Tabel Lokasi Kantor (office_locations) - Mendukung 3 Lokasi
    $pdo->exec("CREATE TABLE IF NOT EXISTS office_locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(150) NOT NULL,
        address TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        radius_meters INTEGER DEFAULT 150,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // 4. Tabel Presensi (attendances)
    $pdo->exec("CREATE TABLE IF NOT EXISTS attendances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_nim VARCHAR(50) NOT NULL,
        type VARCHAR(20) NOT NULL, -- 'masuk' atau 'pulang'
        photo_path VARCHAR(255) NOT NULL,
        latitude REAL,
        longitude REAL,
        location_name TEXT,
        office_id INTEGER,
        distance_meters REAL,
        status VARCHAR(30) DEFAULT 'Terverifikasi', -- 'Terverifikasi', 'Terlambat', 'Perlu tinjauan', 'Izin'
        work_duration VARCHAR(50),
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_nim) REFERENCES students(nim) ON DELETE CASCADE
    )");

    // 5. Tabel Logbook Harian (logbooks)
    $pdo->exec("CREATE TABLE IF NOT EXISTS logbooks (
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
    )");

    // 6. Tabel Pengaturan (settings)
    $pdo->exec("CREATE TABLE IF NOT EXISTS settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT
    )");

    // ---------------------------------------------------------
    // MIGRASI KOLOM TAMBAHAN JIKA TABEL SUDAH ADA SEBELUMNYA
    // ---------------------------------------------------------
    $tableColumns = function($tableName) use ($pdo) {
        $cols = [];
        $stmt = $pdo->query("PRAGMA table_info($tableName)");
        while ($row = $stmt->fetch()) {
            $cols[] = $row['name'];
        }
        return $cols;
    };

    $studentCols = $tableColumns('students');
    if (!in_array('supervisor', $studentCols)) {
        $pdo->exec("ALTER TABLE students ADD COLUMN supervisor VARCHAR(150) DEFAULT 'Pembimbing Magang'");
    }
    if (!in_array('status', $studentCols)) {
        $pdo->exec("ALTER TABLE students ADD COLUMN status VARCHAR(20) DEFAULT 'Aktif'");
    }

    $attendanceCols = $tableColumns('attendances');
    if (!in_array('office_id', $attendanceCols)) {
        $pdo->exec("ALTER TABLE attendances ADD COLUMN office_id INTEGER");
    }
    if (!in_array('distance_meters', $attendanceCols)) {
        $pdo->exec("ALTER TABLE attendances ADD COLUMN distance_meters REAL");
    }
    if (!in_array('status', $attendanceCols)) {
        $pdo->exec("ALTER TABLE attendances ADD COLUMN status VARCHAR(30) DEFAULT 'Terverifikasi'");
    }
    if (!in_array('work_duration', $attendanceCols)) {
        $pdo->exec("ALTER TABLE attendances ADD COLUMN work_duration VARCHAR(50)");
    }

    // ---------------------------------------------------------
    // SEEDING DATA AWAL
    // ---------------------------------------------------------

    // A. Seed Admin Default: Nadia Putri
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM admins");
    if ($stmt->fetch()['count'] == 0) {
        $adminStmt = $pdo->prepare("INSERT INTO admins (username, email, name, password, role) VALUES (?, ?, ?, ?, ?)");
        $adminStmt->execute([
            'admin',
            'nadia.putri@hadirin.id',
            'Nadia Putri',
            password_hash('admin123', PASSWORD_BCRYPT),
            'Administrator'
        ]);
    }

    // B. Seed 3 Lokasi Kantor
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM office_locations");
    if ($stmt->fetch()['count'] == 0) {
        $locStmt = $pdo->prepare("INSERT INTO office_locations (name, address, latitude, longitude, radius_meters, is_active) VALUES (?, ?, ?, ?, ?, ?)");
        $locations = [
            [
                'Kantor Pusat · Gedung A',
                'Jl. Pemuda No. 12, Semarang',
                -6.9842,
                110.4091,
                150,
                1
            ],
            [
                'Gedung B · Balai Inovasi',
                'Jl. Pahlawan No. 45, Semarang',
                -6.9925,
                110.4208,
                150,
                1
            ],
            [
                'Gedung C · Laboratorium & Riset',
                'Jl. Imam Bonjol No. 88, Semarang',
                -6.9750,
                110.4120,
                200,
                1
            ]
        ];
        foreach ($locations as $loc) {
            $locStmt->execute($loc);
        }
    }

    // C. Seed Pengaturan Default
    $defaultSettings = [
        'work_start' => '08:00',
        'work_end' => '17:00',
        'late_tolerance' => '10',
        'auto_mark_late' => '1',
        'require_photo_in' => '1',
        'require_photo_out' => '1',
        'require_face_detection' => '1',
        'save_location' => '1',
        'app_name' => 'Hadirin',
        'app_subtitle' => 'Sistem Presensi & Logbook Magang'
    ];
    $checkSetting = $pdo->prepare("SELECT setting_value FROM settings WHERE setting_key = ?");
    $insertSetting = $pdo->prepare("INSERT OR REPLACE INTO settings (setting_key, setting_value) VALUES (?, ?)");
    foreach ($defaultSettings as $k => $v) {
        $checkSetting->execute([$k]);
        if (!$checkSetting->fetch()) {
            $insertSetting->execute([$k, $v]);
        }
    }

    // D. Seed Data Mahasiswa Magang (Sesuai rancangan PDF)
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM students");
    if ($stmt->fetch()['count'] < 5) {
        $seedStudents = [
            ['231011401234', 'Raka Aditya', 'PT Nusantara Digital', 'UI/UX Design', 'Dian Pratiwi', 'Aktif'],
            ['231011401235', 'Siti Nurhaliza', 'Dinas Kominfo', 'Frontend Development', 'Fajar Maulana', 'Aktif'],
            ['231011401236', 'Bagas Pratama', 'Bank Jateng', 'Data Analytics', 'Rina Kusuma', 'Aktif'],
            ['231011401237', 'Alya Ramadhani', 'Suara Merdeka', 'Content & Media', 'Yoga Prasetyo', 'Aktif'],
            ['231011401238', 'Dimas Saputra', 'Nusantara Tech', 'Backend Development', 'Arif Wibowo', 'Nonaktif'],
        ];
        $insertStudent = $pdo->prepare("INSERT OR IGNORE INTO students (nim, name, institution, division, supervisor, status) VALUES (?, ?, ?, ?, ?, ?)");
        foreach ($seedStudents as $st) {
            $insertStudent->execute($st);
        }
    }

    // E. Seed Data Logbook Awal jika masih kosong
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM logbooks");
    if ($stmt->fetch()['count'] == 0) {
        $seedLogbooks = [
            [
                '231011401234',
                'Riset pola navigasi aplikasi',
                'Menganalisis alur pengguna dan menyusun rekomendasi struktur navigasi untuk sistem mobile presensi.',
                450,
                date('Y-m-d'),
                2,
                'Menunggu',
                null
            ],
            [
                '231011401235',
                'Implementasi halaman profil',
                'Membangun komponen profil responsif dan integrasi endpoint pengguna dengan verifikasi token.',
                480,
                date('Y-m-d', strtotime('-1 day')),
                1,
                'Menunggu',
                null
            ],
            [
                '231011401236',
                'Pembersihan data survei',
                'Validasi data duplikat dan normalisasi format tanggapan responden dari kuisioner lapangan.',
                405,
                date('Y-m-d', strtotime('-2 days')),
                0,
                'Revisi',
                'Mohon sertakan visualisasi grafik distribusi sebelum dan sesudah normalisasi.'
            ],
            [
                '231011401237',
                'Kalender konten Oktober',
                'Menyusun tema mingguan dan draf caption kanal media sosial beserta aset visual pendukung.',
                420,
                date('Y-m-d', strtotime('-3 days')),
                3,
                'Disetujui',
                'Bagus sekali, teruskan penjadwalan publish konten.'
            ],
        ];
        $insertLog = $pdo->prepare("INSERT INTO logbooks (student_nim, title, description, duration_minutes, date, attachment_count, status, admin_feedback) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        foreach ($seedLogbooks as $lb) {
            $insertLog->execute($lb);
        }
    }

    // F. Seed Data Presensi Hari Ini jika masih kosong
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM attendances");
    if ($stmt->fetch()['count'] == 0) {
        $today = date('Y-m-d');
        $seedAttendances = [
            [
                '231011401234',
                'masuk',
                'uploads/demo_raka_masuk.jpg',
                -6.9842,
                110.4091,
                'Kantor Pusat · Gedung A',
                1,
                18.0,
                'Terverifikasi',
                null,
                'Presensi pagi tepat waktu',
                $today . ' 08:02:15'
            ],
            [
                '231011401235',
                'masuk',
                'uploads/demo_siti_masuk.jpg',
                -6.9842,
                110.4091,
                'Kantor Pusat · Gedung A',
                1,
                24.0,
                'Terverifikasi',
                null,
                'Presensi masuk lancar',
                $today . ' 07:56:40'
            ],
            [
                '231011401236',
                'masuk',
                'uploads/demo_bagas_masuk.jpg',
                -6.9925,
                110.4208,
                'Gedung B · Balai Inovasi',
                2,
                31.0,
                'Terlambat',
                null,
                'Terlambat karena kendala lalu lintas',
                $today . ' 08:17:20'
            ],
            [
                '231011401237',
                'masuk',
                'uploads/demo_alya_masuk.jpg',
                -6.9842,
                110.4091,
                'Kantor Pusat · Gedung A',
                1,
                12.0,
                'Perlu tinjauan',
                null,
                'Wajah sedikit buram saat capture',
                $today . ' 08:05:08'
            ]
        ];

        $insAtt = $pdo->prepare("INSERT INTO attendances 
            (student_nim, type, photo_path, latitude, longitude, location_name, office_id, distance_meters, status, work_duration, note, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        foreach ($seedAttendances as $att) {
            $insAtt->execute($att);
        }
    }

} catch (PDOException $e) {
    die("Koneksi database gagal: " . $e->getMessage());
}

// -------------------------------------------------------------
// HELPER FUNCTIONS
// -------------------------------------------------------------

// Helper: Haversine distance in meters between two lat/lng coordinates
function calculateDistanceMeters($lat1, $lon1, $lat2, $lon2) {
    $earthRadius = 6371000; // in meters
    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);
    $a = sin($dLat / 2) * sin($dLat / 2) +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
         sin($dLon / 2) * sin($dLon / 2);
    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
    return round($earthRadius * $c, 1);
}

// Helper: Temukan kantor terdekat dari koordinat GPS user
function findNearestOffice($pdo, $lat, $lng) {
    $stmt = $pdo->query("SELECT * FROM office_locations WHERE is_active = 1");
    $offices = $stmt->fetchAll();

    if (empty($offices)) {
        return null;
    }

    $nearest = null;
    $minDist = PHP_FLOAT_MAX;

    foreach ($offices as $office) {
        $dist = calculateDistanceMeters($lat, $lng, (float)$office['latitude'], (float)$office['longitude']);
        if ($dist < $minDist) {
            $minDist = $dist;
            $nearest = $office;
            $nearest['distance_meters'] = $dist;
            $nearest['in_radius'] = ($dist <= (float)$office['radius_meters']);
        }
    }

    return $nearest;
}

// Helper: Format tanggal Indonesia
function formatTanggalIndo($datetime) {
    if (!$datetime) return '-';
    $days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    $months = [
        1 => 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    $timestamp = strtotime($datetime);
    $dayName = $days[(int)date('w', $timestamp)];
    $day = date('d', $timestamp);
    $month = $months[(int)date('m', $timestamp)];
    $year = date('Y', $timestamp);
    $time = date('H:i', $timestamp);

    return "$dayName, $day $month $year - $time WIB";
}

function formatTanggalSingkat($date) {
    if (!$date) return '-';
    $months = [
        1 => 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    $ts = strtotime($date);
    $d = date('j', $ts);
    $m = $months[(int)date('n', $ts)];
    return "$d $m";
}

// Helper: Validasi Keberadaan Wajah Manusia pada Foto Selfie
function validateHumanFaceInImage($imageBinary) {
    if (empty($imageBinary)) {
        return ['valid' => false, 'reason' => 'Data gambar kosong atau tidak terbaca'];
    }

    if (!extension_loaded('gd')) {
        // Fallback jika GD tidak tersedia
        return ['valid' => true, 'reason' => 'GD tidak aktif, lewati verifikasi'];
    }

    $img = @imagecreatefromstring($imageBinary);
    if (!$img) {
        return ['valid' => false, 'reason' => 'Format gambar selfie tidak valid'];
    }

    $w = imagesx($img);
    $h = imagesy($img);
    if ($w < 120 || $h < 120) {
        imagedestroy($img);
        return ['valid' => false, 'reason' => 'Resolusi foto terlalu kecil'];
    }

    // Sampel area sentral 60% gambar (lokasi wajah manusia di dalam oval/frame)
    $startX = (int)($w * 0.2);
    $endX = (int)($w * 0.8);
    $startY = (int)($h * 0.15);
    $endY = (int)($h * 0.85);

    $stepX = max(1, (int)(($endX - $startX) / 30));
    $stepY = max(1, (int)(($endY - $startY) / 30));

    $skinCount = 0;
    $totalSampled = 0;
    $luminanceSum = 0;
    $luminances = [];

    for ($y = $startY; $y < $endY; $y += $stepY) {
        for ($x = $startX; $x < $endX; $x += $stepX) {
            $rgb = imagecolorat($img, $x, $y);
            $r = ($rgb >> 16) & 0xFF;
            $g = ($rgb >> 8) & 0xFF;
            $b = $rgb & 0xFF;

            // YCbCr skin tone detection
            $cb = 128 - 0.168736 * $r - 0.331264 * $g + 0.5 * $b;
            $cr = 128 + 0.5 * $r - 0.418688 * $g - 0.081312 * $b;
            $lum = 0.299 * $r + 0.587 * $g + 0.114 * $b;

            $luminances[] = $lum;
            $luminanceSum += $lum;
            $totalSampled++;

            // Kluster warna kulit manusia universal
            if ($cb >= 77 && $cb <= 127 && $cr >= 133 && $cr <= 173) {
                if ($lum > 30 && $lum < 240) {
                    $skinCount++;
                }
            }
        }
    }

    imagedestroy($img);

    if ($totalSampled === 0) {
        return ['valid' => false, 'reason' => 'Gagal memproses sampel gambar'];
    }

    // Variasi kecerahan (kontras mata, alis, bibir, hidung)
    $meanLum = $luminanceSum / $totalSampled;
    $varianceSum = 0;
    foreach ($luminances as $l) {
        $varianceSum += pow($l - $meanLum, 2);
    }
    $stdDev = sqrt($varianceSum / $totalSampled);

    // 1. Cek foto gelap gulita / tertutup tangan
    if ($meanLum < 20) {
        return ['valid' => false, 'reason' => 'Kamera terlalu gelap atau tertutup objek. Harap ambil foto di tempat yang cukup terang.'];
    }

    // 2. Cek foto polos / dinding datar tanpa fitur manusia
    if ($stdDev < 10) {
        return ['valid' => false, 'reason' => 'Foto terlalu polos (seperti dinding/meja). Harap arahkan kamera ke wajah Anda.'];
    }

    // 3. Rasio piksel kulit manusia di area wajah
    $skinRatio = $skinCount / $totalSampled;
    if ($skinRatio < 0.10) {
        return ['valid' => false, 'reason' => 'Wajah manusia tidak terdeteksi pada foto selfie! Pastikan wajah Anda berada di dalam bingkai kamera.'];
    }

    return [
        'valid' => true,
        'skin_ratio' => $skinRatio,
        'std_dev' => $stdDev
    ];
}
