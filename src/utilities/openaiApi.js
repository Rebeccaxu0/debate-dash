import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Get the response from the OpenAI API
export const getCandidateResponse = async (conversationHistory) => {
  // console.log(conversationHistory);
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    max_tokens: 200,
    messages: conversationHistory,
  });

  return response.choices[0].message.content;
};
