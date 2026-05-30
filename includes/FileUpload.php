<?php

declare(strict_types=1);

final class FileUpload
{
    /**
     * @return array{ok: bool, stored_name?: string, original_name?: string, mime?: string, size?: int, error?: string}
     */
    public static function handleOptional(array $file, string $uploadDir): array
    {
        if (!isset($file['error']) || $file['error'] === UPLOAD_ERR_NO_FILE) {
            return ['ok' => true];
        }

        if ($file['error'] !== UPLOAD_ERR_OK) {
            return ['ok' => false, 'error' => 'File upload failed. Please try again.'];
        }

        $config = app_config()['upload'];
        $maxSize = (int) $config['max_size'];

        if ((int) $file['size'] > $maxSize) {
            return ['ok' => false, 'error' => 'File is too large. Maximum allowed size is 5 MB.'];
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']) ?: '';
        $allowedMime = $config['allowed_mime'];

        if (!in_array($mime, $allowedMime, true)) {
            return ['ok' => false, 'error' => 'Invalid file type. Allowed: PDF, JPG, PNG, WEBP.'];
        }

        $extension = strtolower(pathinfo((string) $file['name'], PATHINFO_EXTENSION));
        $allowedExt = $config['allowed_extensions'];

        if (!in_array($extension, $allowedExt, true)) {
            return ['ok' => false, 'error' => 'Invalid file extension.'];
        }

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0750, true);
        }

        $storedName = bin2hex(random_bytes(16)) . '.' . $extension;
        $destination = $uploadDir . DIRECTORY_SEPARATOR . $storedName;

        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            return ['ok' => false, 'error' => 'Could not save uploaded file.'];
        }

        @chmod($destination, 0640);

        return [
            'ok' => true,
            'stored_name' => $storedName,
            'original_name' => Security::sanitizeString((string) $file['name'], 255),
            'mime' => $mime,
            'size' => (int) $file['size'],
        ];
    }
}
