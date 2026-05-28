/**
 * Creates a single particle with random position and velocity.
 * @param {number} width  - canvas width boundary
 * @param {number} height - canvas height boundary
 * @returns {{ x: number, y: number, vx: number, vy: number, radius: number }}
 */
function createParticle(width, height) {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    radius: Math.random() * 2 + 1,
  };
}

/**
 * Advances a particle by one step, bouncing off canvas edges.
 * Mutates the particle in place and returns it.
 * @param {{ x: number, y: number, vx: number, vy: number, radius: number }} particle
 * @param {number} width
 * @param {number} height
 * @returns {typeof particle}
 */
function updateParticle(particle, width, height) {
  particle.x += particle.vx;
  particle.y += particle.vy;
  if (particle.x < 0 || particle.x > width) particle.vx *= -1;
  if (particle.y < 0 || particle.y > height) particle.vy *= -1;
  return particle;
}

/**
 * Renders activity items into a container element.
 * @param {Array<{ text: string, time: string }>} activities
 * @param {HTMLElement} container
 */
function renderActivities(activities, container) {
  container.innerHTML = '';
  activities.forEach(function (activity) {
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = '<p>' + activity.text + '</p><small>' + activity.time + '</small>';
    container.appendChild(item);
  });
}

/**
 * Initialises the particle canvas, renders activity feed, and wires up
 * the resize listener. Call once the DOM is ready.
 */
function initDashboard() {
  var canvas = document.getElementById('particles');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var particles = [];
  for (var i = 0; i < 100; i++) {
    particles.push(createParticle(canvas.width, canvas.height));
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    particles.forEach(function (p) {
      updateParticle(p, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }

  animate();

  var activities = [
    { text: 'New AI model deployed: NeuralNet-V5', time: '2 minutes ago' },
    { text: 'Team meeting scheduled for tomorrow', time: '15 minutes ago' },
    { text: 'System backup completed successfully', time: '1 hour ago' },
    { text: 'New employee onboarded: Sarah Chen', time: '3 hours ago' },
    { text: 'Q4 performance report generated', time: '5 hours ago' },
  ];

  var activityDiv = document.getElementById('activity');
  if (activityDiv) renderActivities(activities, activityDiv);

  window.addEventListener('resize', function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

if (typeof module !== 'undefined') {
  module.exports = { createParticle, updateParticle, renderActivities, initDashboard };
}
