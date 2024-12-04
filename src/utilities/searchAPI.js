import axios from 'axios';
import { convert } from 'html-to-text';

export const getCandidateStance = async (query) => {
    const response = await axios.get(
        `https://www.googleapis.com/customsearch/v1`,
        {
            params: {
                key: process.env.REACT_APP_SEARCH_API_KEY,
                cx: 'b277a2fae221840dc',
                q:  `${query} -book`,
                num: 2,
            },
        }
    );

    // const targetUrl = response.data.items[0].link;
    console.log(response.data.items[0].link);
    console.log(response.data.items[1].link);
    const proxyUrl = "http://localhost:8080/";

    let text = "";
    for (const item of response.data.items) {
        const res = await fetch(proxyUrl+item.link);
        const html = await res.text();
        text += item.link + " says: ";
        let articleText = convert(html, {
            selectors: [ 
                { selector: 'a', options: { ignoreHref: true } },
                { selector: 'img', format: 'skip' },
                { selector: 'nav', format: 'skip' },
                { selector: 'header', format: 'skip' },
            ],
        });
        if (articleText.length > 5000) {
            articleText = articleText.slice(0, 5000);
        }
        text += articleText + "\n";
    }

    console.log(text);
    return text;
};

export const getCandidateHeadshot = async (candidateName) => {
    try {
        const response = await axios.get(
            `https://www.googleapis.com/customsearch/v1`,
            {
                params: {
                    key: process.env.REACT_APP_SEARCH_API_KEY,
                    cx: 'b277a2fae221840dc',
                    q: `${candidateName} headshot`,
                    searchType: 'image',
                    num: 1,
                },
            }
        );

        // Return the first image link
        return response.data.items[0].link;
    } catch (error) {
        console.error("Error fetching candidate headshot:", error);
        return null;
    }
};