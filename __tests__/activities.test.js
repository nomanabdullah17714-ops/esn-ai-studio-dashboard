/**
 * @jest-environment jsdom
 */
const { renderActivities } = require('../dashboard');

function makeContainer() {
  const div = document.createElement('div');
  document.body.appendChild(div);
  return div;
}

afterEach(() => {
  document.body.innerHTML = '';
});

const SAMPLE_ACTIVITIES = [
  { text: 'New AI model deployed: NeuralNet-V5', time: '2 minutes ago' },
  { text: 'Team meeting scheduled for tomorrow', time: '15 minutes ago' },
  { text: 'System backup completed successfully', time: '1 hour ago' },
];

describe('renderActivities', () => {
  test('renders one item per activity', () => {
    const container = makeContainer();
    renderActivities(SAMPLE_ACTIVITIES, container);
    expect(container.querySelectorAll('.activity-item')).toHaveLength(3);
  });

  test('each item carries the activity-item class', () => {
    const container = makeContainer();
    renderActivities(SAMPLE_ACTIVITIES, container);
    container.querySelectorAll('.activity-item').forEach(item => {
      expect(item.classList.contains('activity-item')).toBe(true);
    });
  });

  test('renders activity text inside a <p> tag', () => {
    const container = makeContainer();
    renderActivities(SAMPLE_ACTIVITIES, container);
    const items = container.querySelectorAll('.activity-item');
    expect(items[0].querySelector('p').textContent).toBe('New AI model deployed: NeuralNet-V5');
    expect(items[1].querySelector('p').textContent).toBe('Team meeting scheduled for tomorrow');
    expect(items[2].querySelector('p').textContent).toBe('System backup completed successfully');
  });

  test('renders time inside a <small> tag', () => {
    const container = makeContainer();
    renderActivities(SAMPLE_ACTIVITIES, container);
    const items = container.querySelectorAll('.activity-item');
    expect(items[0].querySelector('small').textContent).toBe('2 minutes ago');
    expect(items[2].querySelector('small').textContent).toBe('1 hour ago');
  });

  test('clears previous content before re-rendering', () => {
    const container = makeContainer();
    renderActivities(SAMPLE_ACTIVITIES, container);
    renderActivities([{ text: 'Only one', time: 'now' }], container);
    expect(container.querySelectorAll('.activity-item')).toHaveLength(1);
  });

  test('handles an empty activity array gracefully', () => {
    const container = makeContainer();
    renderActivities([], container);
    expect(container.querySelectorAll('.activity-item')).toHaveLength(0);
    expect(container.innerHTML).toBe('');
  });

  test('renders all five default dashboard activities', () => {
    const defaultActivities = [
      { text: 'New AI model deployed: NeuralNet-V5', time: '2 minutes ago' },
      { text: 'Team meeting scheduled for tomorrow', time: '15 minutes ago' },
      { text: 'System backup completed successfully', time: '1 hour ago' },
      { text: 'New employee onboarded: Sarah Chen', time: '3 hours ago' },
      { text: 'Q4 performance report generated', time: '5 hours ago' },
    ];
    const container = makeContainer();
    renderActivities(defaultActivities, container);
    expect(container.querySelectorAll('.activity-item')).toHaveLength(5);
  });
});
