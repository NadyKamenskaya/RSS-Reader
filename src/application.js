import keyBy from 'lodash/keyBy.js';
import isEmpty from 'lodash/isEmpty.js';
import * as yup from 'yup';
import onChange from 'on-change';
import initView from './view.js';

yup.setLocale({
  string: {
    url: 'Ссылка должна быть валидным URL',
  },
});

const schema = yup.object().shape({
  website: yup.string().url(),
});

const validate = (fields) => {
  try {
    schema.validateSync(fields, { abortEarly: false });
    return {};
  } catch (e) {
    return keyBy(e.inner, 'path');
  }
};

const app = () => {
  const state = {
    urlForm: {
      data: {
        website: '',
      },
      feeds: [],
      error: '',
    },
  };

  const form = document.querySelector('.rss-form');

  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'urlForm.error':
        initView(state.urlForm.error);
        break;
      default:
        break;
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const value = formData.get('url');
    watchedState.urlForm.data.website = value;
    const error = validate(watchedState.urlForm.data).website;
    watchedState.urlForm.error = error;

    if (isEmpty(error)) {
      if (watchedState.urlForm.feeds.includes(value)) {
        watchedState.urlForm.error = 'RSS уже существует';
      } else {
        watchedState.urlForm.feeds.push(value);
      }
    }
  });
};

export default app;
