import axios from "axios";

export const suggestMedicinesAI = async (req, res) => {
    try {
        const { symptom } = req.body;

        if (!symptom) {
            return res.status(400).json({
                success: false,
                data: [],
            });
        }

        const prompt = `
You are a medical assistant.

Problem: ${symptom}

Return ONLY valid JSON array:

[
  {
    "name": "medicine",
    "dosage": "dose",
    "duration": "days",
    "instructions": "how to take"
  }
]

No text. Only JSON.
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


        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        let data = [];

        try {
            data = JSON.parse(text);
            if (!Array.isArray(data)) data = [];
        } catch (err) {
            data = [];
        }

        return res.json({
            success: true,
            data,
        });

    } catch (error) {
        return res.json({
            success: true,
            data: [],
        });
    }
};