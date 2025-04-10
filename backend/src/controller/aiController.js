const generateContentService = require("../services/aiService");

const ReviewByAI = async (req, res) => {
    try {
        const { code, translateTo } = req.body;

        if (!code || typeof code !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid input: 'code' must be a non-empty string."
            });
        }

        if (translateTo && (!Array.isArray(translateTo) || translateTo.some(lang => typeof lang !== "string"))) {
            return res.status(400).json({
                success: false,
                message: "Invalid input: 'translateTo' must be an array of strings."
            });
        }

        const result = await generateContentService({ code, translateTo });
        console.log("Result from AI : ", result);

        return res.status(200).json({
            success: true,
            message: "Successfully generated the response",
            response: result
        });

    } catch (error) {
        console.error("AI Service Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error. Please try again later.",
            error: error.message || String(error)
        });
    }
};

module.exports = ReviewByAI;
