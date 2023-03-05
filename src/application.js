import i18n from 'i18next';
import keyBy from 'lodash/keyBy.js';
import uniqueId from 'lodash/uniqueId.js';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import ru from './ru.js';
import initView from './view.js';
import parsers from './parsers.js';

yup.setLocale({
  string: {
    url: 'notURL',
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
  const i18nInstance = i18n.createInstance();
  i18nInstance
    .init({
      lng: 'ru',
      debug: true,
      resources: {
        ru,
      },
    })
    .then(() => {});

  const state = {
    urlForm: {
      data: {
        website: '',
      },
      feeds: [],
      posts: [],
      error: '',
    },
  };

  const form = document.querySelector('.rss-form');

  const watchedState = onChange(state, initView(i18nInstance));

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const value = formData.get('url');

    watchedState.urlForm.data.website = value;
    const error = validate(watchedState.urlForm.data).website;

    if (watchedState.urlForm.feeds.find((feed) => feed.link === value)) {
      watchedState.urlForm.error = 'notOneOf';
    } else if (error) {
      watchedState.urlForm.error = error.message;
    } else {
      const currentId = uniqueId();

      const timeout = () => {
        axios.get((`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(watchedState.urlForm.data.website)}`))
          .then((data) => {
            const doc = parsers(data.data.contents);
            return doc;
          })
          .then((doc) => {
            const promises = doc.querySelectorAll('item');
            const promise = Promise.all(promises);

            promise.then((items) => {
              items.map((item) => {
                const itemTitle = item.querySelector('title').textContent;
                const itemDescription = item.querySelector('description').textContent;
                const itemLink = item.querySelector('link').textContent;

                const filter = state.urlForm.posts.filter((post) => post.link === itemLink);
                if (filter.length === 0) {
                  watchedState.urlForm.posts = [...state.urlForm.posts, {
                    feedId: currentId,
                    link: itemLink,
                    title: itemTitle,
                    description: itemDescription,
                    id: uniqueId(),
                  }];
                }

                return watchedState.urlForm.posts;
              });
            });
          });
        setTimeout(timeout, 5000);
      };

      axios.get((`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(watchedState.urlForm.data.website)}`))
        .then((data) => {
          const doc = parsers(data.data.contents);
          return doc;
        })
        .then((doc) => {
          const errorNode = doc.querySelector('parsererror');
          if (errorNode) {
            watchedState.urlForm.error = 'invalidLink';
            return watchedState;
          }
          const title = doc.querySelector('title').textContent;
          const description = doc.querySelector('description').textContent;
          const promises = doc.querySelectorAll('item');
          const promise = Promise.all(promises);

          promise.then((items) => {
            items.map((item) => {
              const itemTitle = item.querySelector('title').textContent;
              const itemDescription = item.querySelector('description').textContent;
              const itemLink = item.querySelector('link').textContent;

              watchedState.urlForm.posts = [...state.urlForm.posts, {
                feedId: currentId,
                link: itemLink,
                title: itemTitle,
                description: itemDescription,
                id: uniqueId(),
              }];

              return watchedState.urlForm.posts;
            });
          });
          watchedState.urlForm.feeds = [...state.urlForm.feeds, {
            feedId: currentId,
            link: `${value}`,
            title,
            description,
          }];
          return watchedState;
        })
        .catch((err) => {
          if (err.message) {
            watchedState.urlForm.error = 'networkError';
            return watchedState;
          }
          throw err;
        })
        .finally(() => {
          setTimeout(timeout, 5000);
        });
    }
  });
};

export default app;
