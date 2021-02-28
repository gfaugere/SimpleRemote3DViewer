<?php

const UPLOAD_DIR = '/opt/uploads';
const MAX_TIME = 7 * 24 * 60 * 60;
const MAX_FILES = 25;

// Basic checks
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    return;
}

if (count($_FILES) !== 1) {
    http_response_code(400);
    echo 'No file found';
    return;
}

// Start by cleaning up 🤷‍♂️
$dir = opendir(UPLOAD_DIR);
$files = [];
while (false !== ($file = readdir($dir))) {
    if ('file' !== filetype(UPLOAD_DIR . '/' . $file)) {
        continue;
    }
    $time = filemtime(UPLOAD_DIR . '/' . $file);
    while (isset($files[$time])) {
        ++$time;
    }
    $files[$time] = $file;
}
closedir($dir);

ksort($files);

$fileCount = 0;
$timeTreshhold = time() - MAX_TIME;
foreach ($files as $timestamp => $file) {
    if ($timestamp < $timeTreshhold || $fileCount++ > MAX_FILES) {
        unlink($file);
    }
}

// Then process upload
$userFileName = basename($_FILES['file']['name']);
if (1 !== preg_match("/\.(obj|stl)$/", $userFileName)) {
    http_response_code(400);
    echo 'File must be stl or obj';
    return;
}

if (false === move_uploaded_file($_FILES['file']['tmp_name'], UPLOAD_DIR . '/' . $userFileName)) {
    http_response_code(500);
    return;
}

http_response_code(201);
header('Location: https://' . $_SERVER['HTTP_HOST'] . '/' . $userFileName);