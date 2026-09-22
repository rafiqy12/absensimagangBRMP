<?php
// index.php - Entry point untuk Sistem Presensi Anak Magang
$distHtml = __DIR__ . '/dist/index.html';

if (file_exists($distHtml)) {
    $content = file_get_contents($distHtml);
    // Sesuaikan path asset relatif ke folder dist
    $content = str_replace('src="./assets/', 'src="./dist/assets/', $content);
    $content = str_replace('href="./assets/', 'href="./dist/assets/', $content);
    echo $content;
} else {
    echo "<h1>Frontend belum di-build. Silakan jalankan 'npm run build' di folder frontend.</h1>";
}
