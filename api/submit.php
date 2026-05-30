<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'message' => 'Method not allowed.'], 405);
}

$config = app_config();
$tokenName = $config['csrf']['token_name'];
$csrfToken = $_POST[$tokenName] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;

if (!Security::validateCsrf(is_string($csrfToken) ? $csrfToken : null)) {
    json_response(['success' => false, 'message' => 'Invalid or expired security token. Please refresh and try again.'], 403);
}

$ip = client_ip();

try {
    $repo = new RegistrationRepository();
} catch (Throwable $exception) {
    log_app('Database unavailable', ['error' => $exception->getMessage(), 'ip' => $ip]);
    json_response([
        'success' => false,
        'message' => 'Service temporarily unavailable. Please try again shortly.',
    ], 503);
}

$rateLimit = (int) $config['security']['rate_limit_submissions_per_hour'];

if ($repo->countSubmissionsSince($ip, 1) >= $rateLimit) {
    json_response([
        'success' => false,
        'message' => 'Too many submissions from your network. Please try again later.',
    ], 429);
}

$validator = new Validator();
$result = $validator->validateRegistration($_POST);

if (!$result['valid']) {
    json_response([
        'success' => false,
        'message' => 'Please correct the highlighted fields.',
        'errors' => $result['errors'],
    ], 422);
}

$userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? (string) $_SERVER['HTTP_USER_AGENT'] : null;

try {
    $registrationId = $repo->create($result['data'], $ip, $userAgent);

    $uploadDir = $config['upload']['path'];
    $fileFields = ['document', 'attachment', 'file'];

    foreach ($fileFields as $field) {
        if (!isset($_FILES[$field])) {
            continue;
        }

        $upload = FileUpload::handleOptional($_FILES[$field], $uploadDir);
        if (!$upload['ok']) {
            $repo->delete($registrationId);
            json_response(['success' => false, 'message' => $upload['error'] ?? 'Upload failed.'], 422);
        }

        if (isset($upload['stored_name'])) {
            $repo->attachFile(
                $registrationId,
                $upload['stored_name'],
                $upload['original_name'],
                $upload['mime'],
                $upload['size']
            );
        }
        break;
    }

    log_app('Registration created', ['id' => $registrationId, 'ip' => $ip]);

    json_response([
        'success' => true,
        'message' => 'Thank you. Your registration details have been captured.',
        'registration_id' => $registrationId,
    ]);
} catch (Throwable $exception) {
    log_app('Registration failed', ['error' => $exception->getMessage(), 'ip' => $ip]);
    json_response([
        'success' => false,
        'message' => 'Unable to save registration. Please try again shortly.',
    ], 500);
}
