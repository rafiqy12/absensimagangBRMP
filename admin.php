<?php
// admin.php - Pintu Masuk Terpisah Khusus Administrator Presensi Hadirin
$distHtml = __DIR__ . '/dist/index.html';

if (file_exists($distHtml)) {
    $content = file_get_contents($distHtml);
    // Sesuaikan path asset relatif ke folder dist
    $content = str_replace('src="./assets/', 'src="./dist/assets/', $content);
    $content = str_replace('href="./assets/', 'href="./dist/assets/', $content);
    // Tandai halaman ini sebagai portal admin khusus
    $adminFlag = '<script>window.IS_ADMIN_PORTAL = true;</script>';
    $content = str_replace('<head>', '<head>' . $adminFlag, $content);
    echo $content;
} else {
    echo "<h1>Frontend belum di-build. Silakan jalankan 'npm run build' di folder frontend.</h1>";
}
