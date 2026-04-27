const STATS_WEBHOOK_URL = window.CONFIG?.STATS_WEBHOOK_URL || 'http://localhost:5678/webhook/sumy-stats';

let chartInstance = null;

async function fetchStats() {
  try {
    const response = await fetch(STATS_WEBHOOK_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();

    if (Array.isArray(data) && data[0]?.json) {
      updateDashboard(data[0].json);
    } else if (data.total !== undefined) {
      updateDashboard(data);
    } else {
      console.error('Unexpected response format:', data);
    }
  } catch (err) {
    console.error('Failed to fetch stats:', err);
    document.getElementById('total-count').textContent = 'Error';
    document.getElementById('good-count').textContent = 'Error';
    document.getElementById('bad-count').textContent = 'Error';
  }
}

function updateDashboard(stats) {
  const totalEl = document.getElementById('total-count');
  const goodEl = document.getElementById('good-count');
  const badEl = document.getElementById('bad-count');

  animateValue(totalEl, parseInt(totalEl.textContent) || 0, stats.total);
  animateValue(goodEl, parseInt(goodEl.textContent) || 0, stats.good);
  animateValue(badEl, parseInt(badEl.textContent) || 0, stats.bad);

  updateChart(stats.good, stats.bad);

  document.getElementById('last-updated').textContent = new Date().toLocaleTimeString();
}

function animateValue(element, start, end) {
  if (start === end) return;
  const duration = 500;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.floor(start + (end - start) * progress);
    element.textContent = current;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

function updateChart(good, bad) {
  const ctx = document.getElementById('reviewChart').getContext('2d');

  if (chartInstance) {
    chartInstance.data.datasets[0].data = [good, bad];
    chartInstance.update();
  } else {
    chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Good', 'Bad'],
        datasets: [{
          data: [good, bad],
          backgroundColor: ['#10b981', '#ef4444'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
}

fetchStats();
setInterval(fetchStats, 30000);
