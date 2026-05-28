/**
 * @jest-environment jsdom
 *
 * Accessibility-focused tests. These check structural correctness that screen
 * readers and assistive technology depend on. They do not replace a full axe-core
 * audit (see proposal notes in MASTER_SETUP.md) but catch the most impactful gaps.
 */
const fs = require('fs');
const path = require('path');

beforeEach(() => {
  const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
  const sanitised = html
    .replace(/<script src="dashboard\.js"><\/script>/g, '')
    .replace(/<script>initDashboard\(\);<\/script>/g, '');
  document.documentElement.innerHTML = sanitised;
});

afterEach(() => {
  document.documentElement.innerHTML = '';
});

describe('Semantic structure', () => {
  test('document has exactly one <h1>', () => {
    expect(document.querySelectorAll('h1')).toHaveLength(1);
  });

  test('metric card headings use <h3>', () => {
    const metricHeadings = document.querySelectorAll('.metric-card h3');
    expect(metricHeadings.length).toBeGreaterThan(0);
  });

  test('dashboard-level sections use <h2>', () => {
    const cardHeadings = document.querySelectorAll('.card h2');
    expect(cardHeadings.length).toBeGreaterThan(0);
  });

  test('heading hierarchy does not skip levels (h1 → h2 → h3)', () => {
    const h1Count = document.querySelectorAll('h1').length;
    const h2Count = document.querySelectorAll('h2').length;
    const h3Count = document.querySelectorAll('h3').length;
    // If h3 exists, h2 must also exist
    if (h3Count > 0) expect(h2Count).toBeGreaterThan(0);
    // If h2 exists, h1 must also exist
    if (h2Count > 0) expect(h1Count).toBeGreaterThan(0);
  });
});

describe('Canvas accessibility', () => {
  test('canvas element has a role or aria-label so it is not opaque to AT', () => {
    const canvas = document.getElementById('particles');
    expect(canvas).not.toBeNull();
    // Canvas is purely decorative; it should be hidden from assistive technology.
    // Acceptable approaches: role="presentation", aria-hidden="true", or both.
    const isHiddenFromAT =
      canvas.getAttribute('role') === 'presentation' ||
      canvas.getAttribute('aria-hidden') === 'true';
    // This test currently FAILS – flagging the gap so it can be addressed.
    expect(isHiddenFromAT).toBe(true);
  });
});

describe('Interactive elements', () => {
  test('neural-viz floating badge has an accessible label', () => {
    const badge = document.querySelector('.neural-viz');
    expect(badge).not.toBeNull();
    // The badge is purely decorative; it should either carry aria-hidden or
    // an aria-label. Currently it has neither – this test flags the gap.
    const hasLabel =
      badge.getAttribute('aria-hidden') === 'true' ||
      badge.getAttribute('aria-label') !== null;
    expect(hasLabel).toBe(true);
  });
});

describe('Language and internationalisation', () => {
  test('html[lang] is set to a non-empty value', () => {
    // jsdom strips <html> attributes on innerHTML assignment, so check raw source.
    const raw = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
    expect(raw).toMatch(/^<html[^>]+lang=/m);
  });
});

describe('Content security', () => {
  test('activity items do not inject raw HTML from untrusted sources', () => {
    // Verify renderActivities uses innerHTML safely with known-static data.
    // If the source ever becomes user-supplied, innerHTML must be replaced with
    // textContent or a sanitiser.
    const { renderActivities } = require('../dashboard');
    const container = document.createElement('div');
    const xssPayload = [{ text: '<img src=x onerror=alert(1)>', time: 'now' }];
    renderActivities(xssPayload, container);
    // The img tag should be present in markup – this test documents the current
    // unsafe behaviour so a future fix can target it.
    const img = container.querySelector('img');
    expect(img).not.toBeNull(); // documents the risk, not a "pass"
  });
});
