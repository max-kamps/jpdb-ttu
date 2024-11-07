// @reader content-script

const start_review_form = document.querySelectorAll<HTMLElement>('form')[0];

if (start_review_form) {
  // Make the regular review button not stick out so much tee hee
  const regular_review_button = start_review_form.querySelector<HTMLElement>('input[type=submit]');
  if (regular_review_button) {
    regular_review_button.style.borderColor = 'var(--text-color)';
    regular_review_button.style.color = 'var(--text-color)';
    regular_review_button.style.width = '11rem';
  }

  const new_review_button = document.createElement('input');
  new_review_button.setAttribute('type', 'button');
  new_review_button.setAttribute('value', 'Review in 2D');
  new_review_button.classList.add('outline');

  Object.assign(new_review_button.style, {
    marginTop: '0.25rem',
    marginBottom: '0.25rem',
    width: '11rem',
    fontWeight: 900,
    borderWidth: '2px',
  });

  start_review_form.insertAdjacentElement('beforebegin', new_review_button);

  new_review_button.addEventListener('click', () => {
    window.location.href = 'https://jpdb.io/deck?id=global&show_only=overdue,failed&sort_by=by-frequency-global#a';
  });
}
