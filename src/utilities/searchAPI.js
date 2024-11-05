import axios from 'axios';
import { convert } from 'html-to-text';

export const getCandidateStance = async (query) => {
    const response = await axios.get(
        `https://www.googleapis.com/customsearch/v1`,
        {
            params: {
                key: process.env.REACT_APP_SEARCH_API_KEY,
                cx: 'b277a2fae221840dc',
                q: query,
                num: 1,
            },
        }
    );
    console.log(response);


    const targetUrl = response.data.items[0].link;
    console.log(targetUrl);
    const proxyUrl = "http://localhost:8080/";
    const res = await fetch(proxyUrl+targetUrl);
    const html = await res.text();
    const text = convert(html, {
        selectors: [ 
            { selector: 'a', options: { ignoreHref: true } },
            { selector: 'img', format: 'skip' },
            { selector: 'nav', format: 'skip' },
            { selector: 'header', format: 'skip' },
        ],
    });
    console.log(text);

    return text;
};