const renderErrors = (i18next, elements, error) => {
  const { input, feedback } = elements;

  input.classList.add('is-invalid');
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');
  feedback.textContent = i18next.t(error);
};

export default renderErrors;
