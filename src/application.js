import 'bootstrap';
import './styles.scss';
import i18n from 'i18next';
import uniqueId from 'lodash/uniqueId.js';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import ru from './ru.js';
import initView from './view.js';
import parse from './parse.js';
import buildUrlProxy from './buildUrlProxy.js';

const app = () => {
  yup.setLocale({
    mixed: {
      required: 'isEmpty',
      notOneOf: 'notOneOf',
    },
    string: {
      url: 'notURL',
    },
  });

  const validate = (schema, field) => schema.validate(field);

  const state = {
    loadingState: {
      error: null,
      status: 'idle',
    },
    form: {
      error: null,
      status: 'filling',
    },
    feeds: [],
    posts: [],
    ui: {
      modal: {
        postId: null,
      },
      viewedPostIds: new Set(),
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    buttonForm: document.querySelector('.h-100'),
    feedback: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    linkFooter: document.querySelector('.full-article'),
  };

  const i18nInstance = i18n.createInstance();
  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources: {
        ru,
      },
    })
    .then((translate) => {
      const watchedState = onChange(state, initView(translate, state, elements));

      const addPosts = (post, id) => {
        watchedState.posts = [...state.posts, {
          feedId: id,
          link: post.link,
          title: post.title,
          description: post.description,
          id: uniqueId(),
        }];
      };

      const getErrorType = (error) => {
        if (error.isParseError) {
          watchedState.loadingState.error = 'rssInvalid';
        } else if (error.isAxiosError) {
          watchedState.loadingState.error = 'networkError';
        } else {
          watchedState.loadingState.error = 'unknown';
        }
      };

      const fetchNewPosts = () => {
        const promises = state.feeds.map((feed) => {
          axios.get(buildUrlProxy(feed.link))
            .then((response) => {
              const data = parse(response.data.contents);
              const currentId = uniqueId();
              data.items.forEach((item) => {
                const filter = state.posts.filter((post) => post.link === item.link);
                if (filter.length === 0) {
                  addPosts(item, currentId);
                }
              });
            });
          return watchedState;
        });
        Promise.all([promises])
          .finally(() => {
            setTimeout(fetchNewPosts, 5000);
          });
      };

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const value = formData.get('url');

        watchedState.loadingState.error = null;
        watchedState.form.error = null;
        watchedState.form.status = 'filling';
        watchedState.loadingState.status = 'load';

        const arrayFeeds = state.feeds.reduce((acc, feed) => [...acc, feed.link], []);

        const schema = yup.string().url().notOneOf(arrayFeeds).required();

        validate(schema, value)
          .then((currentLink) => {
            axios.get(buildUrlProxy(currentLink))
              .then((response) => {
                const data = parse(response.data.contents);
                const currentId = uniqueId();
                watchedState.feeds = [...state.feeds, {
                  feedId: currentId,
                  link: currentLink,
                  title: data.title,
                  description: data.description,
                }];
                data.items.forEach((item) => {
                  addPosts(item, currentId);
                });
                watchedState.loadingState.status = 'success';
              })
              .catch((error) => {
                console.log('Hello');
                getErrorType(error);
                watchedState.form.status = 'failed';
                watchedState.loadingState.status = 'idle';
              });
          })
          .catch((error) => {
            watchedState.form.error = error.message;
            watchedState.form.status = 'failed';
            watchedState.loadingState.status = 'idle';
          });
      });

      elements.postsContainer.addEventListener('click', (e) => {
        const currentPostId = (e.target.tagName === 'A')
          ? e.target.dataset.id
          : e.target.previousElementSibling.dataset.id;

        if (e.target.tagName === 'BUTTON') {
          watchedState.ui.modal.postId = currentPostId;
        }
        watchedState.ui.viewedPostIds.add(currentPostId);
      });

      fetchNewPosts();
    });
};

export default app;
