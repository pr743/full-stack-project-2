import axios from "axios";

export const suggestMedicinesAI = async (req, res) => {
    try {
        const { symptom } = req.body;

        if (!symptom) {
            return res.status(400).json({
                success: false,
                message: "Symptom required",
            });
        }

        const prompt = `
You are a medical assistant.

Problem: ${symptom}

Return ONLY JSON array like:
[
  {
    "name": "medicine name",
    "dosage": "dose",
    "duration": "days",
    "instructions": "how to take"
  }
]

No explanation. Only JSON.
`;

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openrouter/auto",
                messages: [{ role: "user", content: prompt }],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        let text = response.data.choices[0].message.content;

        let data;

        try {
            data = JSON.parse(text);
        } catch {
            data = [];
        }

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            message: "AI failed",
        });
    }
};