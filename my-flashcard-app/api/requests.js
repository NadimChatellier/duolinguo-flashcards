const axios = require('axios');



const fetchTranslation = async (word) => {
  const res = await fetch(`/api/translate?word=${encodeURIComponent(word)}`);
  if (!res.ok) {
    console.error('API route error', res.status);
    return null;
  }
  const data = await res.json();
  console.log(data)
  return data;
};


module.exports = { fetchTranslation };

