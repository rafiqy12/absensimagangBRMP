<?php
// api.php - Endpoint API AJAX untuk Sistem Presensi Anak Magang
require_once __DIR__ . '/config.php';

// Handle CORS untuk Vite dev server & production
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Support JSON payload dari fetch()
$rawInput = file_get_contents('php://input');
if (!empty($rawInput)) {
    $jsonData = json_decode($rawInput, true);
    if (is_array($jsonData)) {
        $_POST = array_merge($_POST, $jsonData);
    }
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'get_session':
        if (isset($_SESSION['nim'])) {
            $stmt = $pdo->prepare("SELECT * FROM students WHERE nim = ?");
            $stmt->execute([$_SESSION['nim']]);
            $student = $stmt->fetch();
            if ($student) {
                echo json_encode([
                    'success' => true,
                    'authenticated' => true,
                    'student' => $student
                ]);
                exit;
            }
        }
        echo json_encode([
            'success' => true,
            'authenticated' => false,
            'student' => null
        ]);
        exit;

    case 'login':
        $nim = trim($_POST['nim'] ?? '');
        if (empty($nim)) {
            echo json_encode(['success' => false, 'message' => 'NIM wajib diisi!']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM students WHERE nim = ?");
        $stmt->execute([$nim]);
        $student = $stmt->fetch();

        if ($student) {
            $_SESSION['nim'] = $student['nim'];
            $_SESSION['name'] = $student['name'];
            $_SESSION['institution'] = $student['institution'];
            $_SESSION['division'] = $student['division'];

            echo json_encode([
                'success' => true,
                'message' => 'Login berhasil! Selamat datang, ' . $student['name'],
                'student' => $student
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'not_found' => true,
                'message' => 'NIM belum terdaftar. Silakan lakukan pendaftaran terlebih dahulu.'
            ]);
        }
        exit;

    case 'logout':
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
        echo json_encode(['success' => true, 'message' => 'Berhasil logout']);
        exit;

    case 'register':
        $nim = trim($_POST['nim'] ?? '');
        $name = trim($_POST['name'] ?? '');
        $institution = trim($_POST['institution'] ?? 'Universitas / Sekolah');
        $division = trim($_POST['division'] ?? 'Umum');

        if (empty($nim) || empty($name)) {
            echo json_encode(['success' => false, 'message' => 'NIM dan Nama Lengkap wajib diisi!']);
            exit;
        }

        $check = $pdo->prepare("SELECT nim FROM students WHERE nim = ?");
        $check->execute([$nim]);
        if ($check->fetch()) {
            echo json_encode(['success' => false, 'message' => 'NIM ini sudah terdaftar! Silakan langsung login.']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO students (nim, name, institution, division) VALUES (?, ?, ?, ?)");
        $stmt->execute([$nim, $name, $institution, $division]);

        $_SESSION['nim'] = $nim;
        $_SESSION['name'] = $name;
        $_SESSION['institution'] = $institution;
        $_SESSION['division'] = $division;

        echo json_encode([
            'success' => true,
            'message' => 'Pendaftaran berhasil! Selamat datang, ' . $name,
            'student' => [
                'nim' => $nim,
                'name' => $name,
                'institution' => $institution,
                'division' => $division
            ]
        ]);
        exit;

    case 'submit_attendance':
        if (!isset($_SESSION['nim'])) {
            echo json_encode(['success' => false, 'message' => 'Sesi berakhir, silakan login kembali.']);
            exit;
        }

        $nim = $_SESSION['nim'];
        $type = $_POST['type'] ?? 'masuk';
        $photoData = $_POST['photo'] ?? '';
        $latitude = filter_var($_POST['latitude'] ?? null, FILTER_VALIDATE_FLOAT);
        $longitude = filter_var($_POST['longitude'] ?? null, FILTER_VALIDATE_FLOAT);
        $locationName = trim($_POST['location_name'] ?? '');
        $note = trim($_POST['note'] ?? '');

        // 1. Validasi Tipe Presensi
        if (!in_array($type, ['masuk', 'pulang'])) {
            $type = 'masuk';
        }

        // 2. Validasi Foto Selfie Langsung (Canvas Data URL)
        if (empty($photoData) || !preg_match('/^data:image\/(jpeg|png|jpg);base64,/', $photoData)) {
            echo json_encode([
                'success' => false,
                'message' => 'Foto selfie wajib diambil langsung melalui kamera!'
            ]);
            exit;
        }

        // 3. Validasi Lokasi (Geolocation GPS)
        if ($latitude === false || $longitude === false) {
            echo json_encode([
                'success' => false,
                'message' => 'Lokasi GPS belum terdeteksi. Izinkan akses lokasi browser Anda untuk melanjutkan.'
            ]);
            exit;
        }

        // Proses Decode Foto Base64
        $photoParts = explode(',', $photoData);
        $decodedImage = base64_decode($photoParts[1]);

        if (!$decodedImage) {
            echo json_encode(['success' => false, 'message' => 'Gagal memproses gambar kamera.']);
            exit;
        }

        // Simpan file foto dengan nama unik
        $safeNim = preg_replace('/[^a-zA-Z0-9]/', '', $nim);
        $filename = 'selfie_' . $safeNim . '_' . date('Ymd_His') . '_' . bin2hex(random_bytes(3)) . '.jpg';
        $destination = $uploadDir . '/' . $filename;
        $saved = file_put_contents($destination, $decodedImage);

        if (!$saved) {
            echo json_encode(['success' => false, 'message' => 'Gagal menyimpan foto ke server.']);
            exit;
        }

        $relPhotoPath = 'uploads/' . $filename;

        // Simpan ke database
        $stmt = $pdo->prepare("INSERT INTO attendances 
            (student_nim, type, photo_path, latitude, longitude, location_name, note, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        
        $now = date('Y-m-d H:i:s');
        $stmt->execute([
            $nim,
            $type,
            $relPhotoPath,
            $latitude,
            $longitude,
            $locationName ?: "Lat: $latitude, Lng: $longitude",
            $note,
            $now
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Presensi ' . ucfirst($type) . ' berhasil dikirim!',
            'data' => [
                'type' => $type,
                'time' => date('H:i'),
                'date' => formatTanggalIndo($now),
                'photo' => $relPhotoPath,
                'latitude' => $latitude,
                'longitude' => $longitude,
                'maps_url' => "https://www.google.com/maps?q={$latitude},{$longitude}"
            ]
        ]);
        exit;

    case 'get_today':
        if (!isset($_SESSION['nim'])) {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }

        $nim = $_SESSION['nim'];
        $todayDate = date('Y-m-d');

        $stmt = $pdo->prepare("SELECT * FROM attendances 
            WHERE student_nim = ? AND strftime('%Y-%m-%d', created_at) = ? 
            ORDER BY created_at DESC");
        $stmt->execute([$nim, $todayDate]);
        $logs = $stmt->fetchAll();

        $hasMasuk = null;
        $hasPulang = null;

        foreach ($logs as &$log) {
            $log['formatted_date'] = formatTanggalIndo($log['created_at']);
            $log['maps_url'] = "https://www.google.com/maps?q={$log['latitude']},{$log['longitude']}";
            if ($log['type'] === 'masuk' && !$hasMasuk) {
                $hasMasuk = $log;
            }
            if ($log['type'] === 'pulang' && !$hasPulang) {
                $hasPulang = $log;
            }
        }

        echo json_encode([
            'success' => true,
            'has_masuk' => $hasMasuk,
            'has_pulang' => $hasPulang,
            'all_today' => $logs
        ]);
        exit;

    case 'get_history':
        $nim = $_GET['nim'] ?? ($_SESSION['nim'] ?? '');
        $all = isset($_GET['all']) && $_GET['all'] === 'true';

        if ($all) {
            $sql = "SELECT a.*, s.name as student_name, s.division, s.institution 
                    FROM attendances a 
                    LEFT JOIN students s ON a.student_nim = s.nim 
                    ORDER BY a.created_at DESC LIMIT 100";
            $stmt = $pdo->query($sql);
            $history = $stmt->fetchAll();
        } else {
            if (empty($nim)) {
                echo json_encode(['success' => false, 'message' => 'NIM diperlukan']);
                exit;
            }
            $sql = "SELECT a.*, s.name as student_name, s.division, s.institution 
                    FROM attendances a 
                    LEFT JOIN students s ON a.student_nim = s.nim 
                    WHERE a.student_nim = ? 
                    ORDER BY a.created_at DESC LIMIT 50";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$nim]);
            $history = $stmt->fetchAll();
        }

        foreach ($history as &$item) {
            $item['formatted_date'] = formatTanggalIndo($item['created_at']);
            $item['time_only'] = date('H:i', strtotime($item['created_at']));
            $item['maps_url'] = "https://www.google.com/maps?q={$item['latitude']},{$item['longitude']}";
        }

        echo json_encode([
            'success' => true,
            'history' => $history
        ]);
        exit;

    case 'get_students':
        $stmt = $pdo->query("SELECT nim, name, institution, division FROM students ORDER BY name ASC");
        echo json_encode([
            'success' => true,
            'students' => $stmt->fetchAll()
        ]);
        exit;

    default:
        echo json_encode(['success' => false, 'message' => 'Aksi tidak dikenali']);
        exit;
}
