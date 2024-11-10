// @reader content-script

const start_review_form = document.querySelectorAll<HTMLElement>('form')[0];

if (start_review_form) {
  // Make the regular review button not stick out so much tee hee
  const regular_review_button = start_review_form.querySelector<HTMLElement>('input[type=submit]');
  if (regular_review_button) {
    regular_review_button.style.borderColor = 'var(--text-color)';
    regular_review_button.style.color = 'var(--text-color)';
    regular_review_button.style.width = '12.5rem';
    regular_review_button.setAttribute('value', 'Review normally');
  }

  const new_buttons_container = document.createElement('div');
  new_buttons_container.style.display = 'flex';
  new_buttons_container.style.flexDirection = 'row';
  new_buttons_container.style.gap = '0.5rem';
  new_buttons_container.style.flexWrap = 'wrap';

  const new_review_button = document.createElement('input');
  new_review_button.setAttribute('type', 'button');
  new_review_button.setAttribute('value', 'Review in 2D');
  new_review_button.classList.add('outline');

  Object.assign(new_review_button.style, {
    marginTop: '0',
    marginBottom: '0',
    width: '12.5rem',
    fontWeight: 900,
    borderWidth: '2px',
    textDecoration: 'none',
  });

  new_buttons_container.appendChild(new_review_button);

  const learn_new_button = document.createElement('input');
  learn_new_button.setAttribute('type', 'button');
  learn_new_button.setAttribute('value', 'Learn new words');
  learn_new_button.classList.add('outline');

  Object.assign(learn_new_button.style, {
    color: 'var(--state-known)',
    borderColor: 'var(--state-known)',
    marginTop: '0',
    width: '12.5rem',
    marginBottom: '0',
    fontWeight: 900,
    borderWidth: '2px',
    textDecoration: 'none',
  });

  new_buttons_container.appendChild(learn_new_button);

  start_review_form.insertAdjacentElement('beforebegin', new_buttons_container);

  new_review_button.addEventListener('click', () => {
    window.location.href = 'https://jpdb.io/deck?id=global&show_only=overdue,failed&sort_by=by-frequency-global#a';
  });

  learn_new_button.addEventListener('click', () => {
    window.location.href = 'https://jpdb.io/deck?id=global&show_only=new&sort_by=by-frequency-global#a';
  });
}
