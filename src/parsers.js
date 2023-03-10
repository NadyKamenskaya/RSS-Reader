import uniqueId from 'lodash/uniqueId.js';

const parsers = (response) => {
  const parser = new DOMParser();
  const promise = new Promise((resolve) => {
    const doc = parser.parseFromString(response, 'text/xml');
    const data = {
      errorNode: doc.querySelector('parsererror'),
      title: doc.querySelector('title').textContent,
      description: doc.querySelector('description').textContent,
      items: Promise.all(doc.querySelectorAll('item')).then((items) => items.map((item) => ({
        title: item.querySelector('title').textContent,
        description: item.querySelector('description').textContent,
        link: item.querySelector('link').textContent,
        id: uniqueId(),
      }))),
    };

    resolve(data);
  });

  return promise;
};

export default parsers;
