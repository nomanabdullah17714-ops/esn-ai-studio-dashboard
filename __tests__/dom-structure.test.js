/**
 * @jest-environment jsdom
 */
const fs = require('fs');
const path = require('path');

beforeEach(() => {
  const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
  // Strip the external script tags so jsdom doesn't try to fetch them.
  const sanitised = html
    .replace(/<script src="dashboard\.js"><\/script>/g, '')
    .replace(/<script>initDashboard\(\);<\/script>/g, '');
  document.documentElement.innerHTML = sanitised;
});

afterEach(() => {
  document.documentElement.innerHTML = '';
});

describe('HTML structure', () => {
  test('page has a descriptive <title>', () => {
    expect(document.title).toMatch(/ESN AI STUDIO/i);
  });

  test('page declares a lang attribute on <html>', () => {
    // jsdom strips <html> element attributes when innerHTML is assigned, so
    // we verify the raw source instead.
    const raw = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
    expect(raw).toMatch(/^<html[^>]+lang="en"/m);
  });

  test('viewport meta tag is present', () => {
    const viewport = document.querySelector('meta[name="viewport"]');
    expect(viewport).not.toBeNull();
    expect(viewport.getAttribute('content')).toMatch(/width=device-width/);
  });

  test('charset meta tag is present', () => {
    const charset = document.querySelector('meta[charset]');
    expect(charset).not.toBeNull();
    expect(charset.getAttribute('charset').toUpperCase()).toBe('UTF-8');
  });
});

describe('Metric cards', () => {
  test('Active Projects metric card is present', () => {
    const el = document.getElementById('projects');
    expect(el).not.toBeNull();
    expect(el.textContent).toBe('47');
  });

  test('Team Members metric card is present', () => {
    const el = document.getElementById('team');
    expect(el).not.toBeNull();
    expect(el.textContent).toBe('156');
  });

  test('AI Models Deployed metric card is present', () => {
    const el = document.getElementById('models');
    expect(el).not.toBeNull();
    expect(el.textContent).toBe('89');
  });

  test('System Efficiency metric card is present', () => {
    const el = document.getElementById('efficiency');
    expect(el).not.toBeNull();
    expect(el.textContent).toBe('98%');
  });

  test('four metric cards are rendered', () => {
    expect(document.querySelectorAll('.metric-card')).toHaveLength(4);
  });

  test('each metric card has a heading', () => {
    document.querySelectorAll('.metric-card').forEach(card => {
      expect(card.querySelector('h3')).not.toBeNull();
    });
  });
});

describe('Dashboard layout', () => {
  test('header element is present with correct text', () => {
    const h1 = document.querySelector('.header h1');
    expect(h1).not.toBeNull();
    expect(h1.textContent).toBe('ESN AI STUDIO');
  });

  test('activity container exists', () => {
    expect(document.getElementById('activity')).not.toBeNull();
  });

  test('particle canvas element exists', () => {
    expect(document.getElementById('particles')).not.toBeNull();
  });

  test('neural-viz element is present', () => {
    expect(document.querySelector('.neural-viz')).not.toBeNull();
  });

  test('dashboard grid contains two cards', () => {
    const grid = document.querySelector('.dashboard-grid');
    expect(grid).not.toBeNull();
    expect(grid.querySelectorAll('.card')).toHaveLength(2);
  });
});

describe('System Status section', () => {
  test('System Status card heading is present', () => {
    const cards = document.querySelectorAll('.card h2');
    const headings = Array.from(cards).map(h => h.textContent);
    expect(headings).toContain('System Status');
  });

  test('three system-status items are listed', () => {
    const statusCard = Array.from(document.querySelectorAll('.card')).find(
      card => card.querySelector('h2')?.textContent === 'System Status'
    );
    expect(statusCard).not.toBeNull();
    expect(statusCard.querySelectorAll('.activity-item')).toHaveLength(3);
  });

  test('AI Engine status item is present', () => {
    const items = document.querySelectorAll('.card .activity-item p strong');
    const labels = Array.from(items).map(el => el.textContent);
    expect(labels).toContain('AI Engine:');
  });

  test('Database status item is present', () => {
    const items = document.querySelectorAll('.card .activity-item p strong');
    const labels = Array.from(items).map(el => el.textContent);
    expect(labels).toContain('Database:');
  });

  test('API Gateway status item is present', () => {
    const items = document.querySelectorAll('.card .activity-item p strong');
    const labels = Array.from(items).map(el => el.textContent);
    expect(labels).toContain('API Gateway:');
  });
});
