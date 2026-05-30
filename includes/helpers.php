<?php

declare(strict_types=1);

function app_config(): array
{
    /** @var array $config */
    $config = require dirname(__DIR__) . '/config/config.php';

    return $config;
}

function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function json_response(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}

function redirect(string $url): never
{
    header('Location: ' . $url);
    exit;
}

function client_ip(): string
{
    $headers = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    foreach ($headers as $header) {
        if (!empty($_SERVER[$header])) {
            $value = (string) $_SERVER[$header];
            if (str_contains($value, ',')) {
                $value = trim(explode(',', $value)[0]);
            }
            if (filter_var($value, FILTER_VALIDATE_IP)) {
                return $value;
            }
        }
    }

    return '0.0.0.0';
}

function log_app(string $message, array $context = []): void
{
    $line = '[' . date('Y-m-d H:i:s') . '] ' . $message;
    if ($context !== []) {
        $line .= ' ' . json_encode($context, JSON_UNESCAPED_UNICODE);
    }
    error_log($line);
}

function format_datetime(?string $datetime): string
{
    if ($datetime === null || $datetime === '') {
        return '—';
    }

    $ts = strtotime($datetime);
    return $ts ? date('d M Y, h:i A', $ts) : e($datetime);
}

function seat_label(string $seat): string
{
    return match ($seat) {
        'micro' => 'Micro',
        'small' => 'Small',
        'medium' => 'Medium',
        'startup' => 'Startup',
        'professionals' => 'Professionals',
        'other' => 'Other',
        default => ucfirst($seat),
    };
}

/** @return list<string> */
function payment_status_values(): array
{
    return ['pending', 'paid', 'failed'];
}

/** @return array<string, string> */
function payment_status_options(): array
{
    return [
        '' => 'Select status',
        'pending' => 'Pending',
        'paid' => 'Payment Done',
        'failed' => 'Not Done',
    ];
}

function payment_status_label(?string $status): string
{
    return match ($status) {
        'paid' => 'Payment Done',
        'failed' => 'Not Done',
        'pending' => 'Pending',
        default => 'Select status',
    };
}

function is_valid_payment_status(?string $status): bool
{
    return $status === null || in_array($status, payment_status_values(), true);
}
