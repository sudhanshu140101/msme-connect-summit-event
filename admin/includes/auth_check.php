<?php



require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

$auth = new Auth();
$auth->requireLogin();
