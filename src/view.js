const initView = (i18next, error) => {
  const form = document.querySelector('.rss-form');
  const input = document.querySelector('#url-input');
  const feedback = document.querySelector('.feedback');

  if (error) {
    input.classList.add('is-invalid');
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.textContent = (!error.message) ? i18next.t(error) : i18next.t(`${error.message}`);
  } else {
    input.classList.remove('is-invalid');
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    feedback.textContent = i18next.t('success');

    form.reset();
    input.focus();
  }
};

export default initView;
