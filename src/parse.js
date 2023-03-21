const parse = (response) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(response, 'text/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    const parsingError = new Error('rssInvalid');
    parsingError.isParseError = true;

    throw parsingError;
  } else {
    const data = {
      title: doc.querySelector('title').textContent,
      description: doc.querySelector('description').textContent,
      items: [],
    };
    doc.querySelectorAll('item').forEach((item) => data.items.push({
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
    }));

    return data;
  }
};

export default parse;
