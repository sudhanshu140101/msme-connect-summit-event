<?php

declare(strict_types=1);

/** @var string $pageTitle */
/** @var string $activeNav */

$config = app_config();
$pageTitle = $pageTitle ?? 'Dashboard';
$activeNav = $activeNav ?? 'dashboard';
$adminName = e($_SESSION['admin_name'] ?? $_SESSION['admin_username'] ?? 'Admin');
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><?= e($pageTitle) ?> — <?= e($config['app_name']) ?> Admin</title>
  <link rel="stylesheet" href="../assets/admin/admin.css" />
</head>
<body class="admin-body">
  <div class="admin-layout">
    <aside class="admin-sidebar" id="admin-sidebar">
      <div class="admin-brand">
        <img src="../images/logo.png" alt="CIMSME" class="admin-brand-mark" width="42" height="42" />
        <div>
          <strong>MSME Connect</strong>
          <small>Admin Panel</small>
        </div>
      </div>
      <nav class="admin-nav" aria-label="Admin navigation">
        <a class="<?= $activeNav === 'dashboard' ? 'active' : '' ?>" href="dashboard.php">Dashboard</a>
        <a class="<?= $activeNav === 'submissions' ? 'active' : '' ?>" href="submissions.php">Submissions</a>
      </nav>
      <div class="admin-sidebar-foot">
        <p>Signed in as<br><strong><?= $adminName ?></strong></p>
        <a class="btn btn-ghost btn-small" href="logout.php">Logout</a>
      </div>
    </aside>

    <div class="admin-main-wrap">
      <header class="admin-topbar">
        <button type="button" class="admin-menu-btn" id="admin-menu-toggle" aria-label="Toggle menu">☰</button>
        <h1><?= e($pageTitle) ?></h1>
      </header>
      <main class="admin-content">
