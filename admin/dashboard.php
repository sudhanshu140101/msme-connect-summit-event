<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth_check.php';

$repo = new RegistrationRepository();
$total = $repo->countAll();
$today = $repo->countToday();
$latest = $repo->getLatest(8);
$statusMessage = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_payment_id'])) {
    $csrf = $_POST['csrf_token'] ?? '';
    if (!Security::validateCsrf(is_string($csrf) ? $csrf : null)) {
        $statusMessage = 'Invalid security token.';
    } else {
        $updateId = (int) $_POST['update_payment_id'];
        $newStatus = strtolower(Security::sanitizeString((string) ($_POST['payment_status'] ?? ''), 16));
        $newStatus = $newStatus === '' ? null : $newStatus;

        if ($repo->updatePaymentStatus($updateId, $newStatus)) {
            redirect('dashboard.php?payment_updated=1');
        }
        $statusMessage = 'Could not update payment status.';
    }
}

if (isset($_GET['payment_updated'])) {
    $latest = $repo->getLatest(8);
}

$csrfToken = Security::getCsrfToken();
$pageTitle = 'Dashboard';
$activeNav = 'dashboard';

require __DIR__ . '/includes/header.php';
?>

<?php if ($statusMessage !== ''): ?>
  <div class="alert alert-error" role="alert"><?= e($statusMessage) ?></div>
<?php endif; ?>

<section class="stats-grid">
  <article class="stat-card">
    <span class="stat-label">Total Submissions</span>
    <strong class="stat-value"><?= number_format($total) ?></strong>
  </article>
  <article class="stat-card">
    <span class="stat-label">Today</span>
    <strong class="stat-value"><?= number_format($today) ?></strong>
  </article>
  <article class="stat-card stat-card-action">
    <a href="submissions.php" class="btn btn-primary">View All Submissions</a>
    <a href="export.php" class="btn btn-secondary">Export CSV</a>
  </article>
</section>

<section class="panel">
  <div class="panel-head">
    <h2>Latest Submissions</h2>
    <a href="submissions.php">See all →</a>
  </div>
  <div class="table-wrap">
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Company</th>
          <th>Category</th>
          <th>Mobile</th>
          <th>State</th>
          <th>Payment</th>
          <th>Submitted</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <?php if ($latest === []): ?>
          <tr><td colspan="9" class="empty-cell">No submissions yet.</td></tr>
        <?php else: ?>
          <?php foreach ($latest as $row): ?>
            <tr>
              <td>#<?= (int) $row['id'] ?></td>
              <td><?= e($row['name']) ?></td>
              <td><?= e((string) ($row['company_name'] ?? '')) ?: '—' ?></td>
              <td><?= e(seat_label((string) $row['seat'])) ?></td>
              <td><?= e($row['mobile']) ?></td>
              <td><?= e($row['state']) ?></td>
              <td><?php require __DIR__ . '/includes/payment_status_field.php'; ?></td>
              <td><?= e(format_datetime($row['created_at'])) ?></td>
              <td><a href="view.php?id=<?= (int) $row['id'] ?>">View</a></td>
            </tr>
          <?php endforeach; ?>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>
