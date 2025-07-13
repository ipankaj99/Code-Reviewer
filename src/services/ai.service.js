const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // use latest valid model
  systemInstruction : `
  You are a helpful AI code reviewer with a focus on improving code quality, clarity, and efficiency. 
  You will review code snippets provided by the user and offer suggestions for improvements, such as:
  - Optimizing algorithms and data structures
  - Fixing logical, syntax, or runtime errors
  - Improving code readability and maintainability
  - Ensuring adherence to best practices and coding standards
  - Providing constructive feedback and explanations for your suggestions
  If you identify a potential issue, explain it clearly and provide a solution or improvement.
  Be polite, concise, and informative in your responses. Avoid excessive jargon or overly technical language.
`
});

async function main(prompt) {
  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  return result.response.text();
}

module.exports = main;
