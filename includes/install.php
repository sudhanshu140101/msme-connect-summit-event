<?php

declare(strict_types=1);

function install_lock_path(): string
{
    return dirname(__DIR__) . '/storage/install.lock';
}

function install_is_complete(): bool
{
    return is_file(install_lock_path());
}

function install_mark_complete(): void
{
    $dir = dirname(install_lock_path());
    if (!is_dir($dir)) {
        @mkdir($dir, 0750, true);
    }
    @file_put_contents(install_lock_path(), date('c') . ' — setup complete' . PHP_EOL);
}

/**
 * Applies incremental schema updates for existing databases (idempotent).
 */
function ensure_database_schema(PDO $db): void
{
    static $ensured = false;
    if ($ensured) {
        return;
    }
    $ensured = true;

    $stmt = $db->query("SHOW COLUMNS FROM `registrations` LIKE 'company_name'");
    if ($stmt !== false && $stmt->fetch() === false) {
        $db->exec(
            'ALTER TABLE `registrations`
             ADD COLUMN `company_name` VARCHAR(120) NULL DEFAULT NULL AFTER `name`'
        );
    }

    $paymentCol = $db->query("SHOW COLUMNS FROM `registrations` LIKE 'payment_status'")->fetch();
    if ($paymentCol !== false && ($paymentCol['Null'] ?? '') === 'NO') {
        $db->exec(
            'ALTER TABLE `registrations`
             MODIFY COLUMN `payment_status` ENUM(\'pending\', \'paid\', \'failed\') NULL DEFAULT NULL'
        );
    }
}
