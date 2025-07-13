const main = require('../services/ai.service');

module.exports.getReview = async (req, res) => {
  const code = req.body.code;

  if (!code) {
    return res.status(400).send("Code is required");
  }

  try {
    const response = await main(code);
    res.send(response);
  } catch (error) {
    console.error('AI Review Error:', error.message);
    res.status(500).send("Something went wrong with AI service");
  }
};
