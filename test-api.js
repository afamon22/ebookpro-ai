import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || "");

async function testConnection() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("SUCCESS: Connection established!");
        console.log("Response:", result.response.text());
    } catch (error) {
        console.error("FAILURE: Connection failed!");
        console.error(error);
    }
}

testConnection();
