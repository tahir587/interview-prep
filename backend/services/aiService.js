import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

let groq = null;
let groqInitialized = false;

const initGroq = () => {
  if (groqInitialized) return;
  
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.warn("GROQ_API_KEY is not set in environment variables");
    groqInitialized = true;
    return;
  }
  
  try {
    groq = new Groq({
      apiKey: apiKey,
    });
    groqInitialized = true;
    console.log("Groq client initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Groq client:", error.message);
    groqInitialized = true;
  }
};

initGroq();

const MODEL = "llama-3.1-8b-instant";

const parseJSON = (text) => {
  try {
    let cleaned = text.replace(/```json|```/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON found");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("AI RESPONSE:", text);
    throw new Error("AI returned invalid JSON");
  }
};

const makeRequest = async (prompt, model = MODEL, temperature = 0.7) => {
  if (!groq) {
    throw new Error("AI service not configured. Please set GROQ_API_KEY in .env file.");
  }
  
  try {
    const response = await groq.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: prompt }],
      temperature: temperature,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Groq API Error:", error.message);
    throw error;
  }
};

/* ================= GENERATE QUESTIONS ================= */

export const generateQuestions = async ({
  type,
  company,
  difficulty,
  count = 5,
}) => {
  const prompt = `Generate ${count} ${difficulty} ${type} interview questions for ${company || "a tech company"}.

Rules:
- Questions should sound like a real interviewer
- Avoid very long questions
- For DSA questions, include the actual problem
- For behavioral, make them STAR-method friendly
- For system design, make them open-ended

Return ONLY JSON in this format:

[{"question":"...", "expectedPoints":["point1","point2"], "questionType":"technical|behavioral|system-design|dsa"}]`;

  const content = await makeRequest(prompt);
  return parseJSON(content);
};

/* ================= WARM-UP PHASE FUNCTIONS ================= */

export const generateWarmUpGreeting = async ({ interviewerName, company }) => {
  const prompt = `
You are ${interviewerName}, a friendly interviewer at ${company}.
Generate a warm, natural greeting to start the interview.

Rules:
- Be casual and friendly, like in a real video call
- Ask about their day or how their commute was
- Keep it very short (1-2 sentences)
- Add a small talk prompt

Return ONLY JSON:
{"greeting": "...", "followUp": "..."}`;

  const content = await makeRequest(prompt, MODEL, 0.8);
  return parseJSON(content);
};

export const generateWarmUpResponse = async ({ 
  userResponse, 
  interviewerName, 
  company 
}) => {
  const prompt = `
You are ${interviewerName}, a friendly interviewer at ${company}.
The candidate just said: "${userResponse}"

Generate a natural, conversational response that:
- Acknowledges what they said
- Adds a small relevant comment
- Transitions naturally to the next question
- Keeps it short and natural

Return ONLY JSON:
{"response": "...", "readyToMoveOn": true|false}`;

  const content = await makeRequest(prompt, MODEL, 0.7);
  return parseJSON(content);
};

export const generateBackgroundQuestions = async () => {
  const prompt = `
Generate 2-3 background/resume questions for the warm-up section.

Rules:
- One about their current role/projects
- One about their experience or skills
- One to transition to technical questions

Return ONLY JSON:
[{"question": "...", "context": "what to mention before asking"}]`;

  const content = await makeRequest(prompt, MODEL, 0.7);
  return parseJSON(content);
};

export const generateBackgroundResponse = async ({
  question,
  userResponse,
  interviewerName
}) => {
  const prompt = `
You are ${interviewerName}, a technical interviewer.
The candidate answered this background question:
Question: "${question}"
Answer: "${userResponse}"

Generate a natural response that:
- Shows active listening
- Picks up on something specific they mentioned
- Asks a natural follow-up if interesting
- If nothing interesting, gives acknowledgment and moves on

Return ONLY JSON:
{"response": "...", "followUpQuestion": "...", "shouldAskFollowUp": true|false}`;

  const content = await makeRequest(prompt, MODEL, 0.7);
  return parseJSON(content);
};

/* ================= CORE QUESTIONS ================= */

export const evaluateAnswer = async ({ question, userAnswer }) => {
  const prompt = `
You are a friendly technical interviewer conducting a real interview.

Question:
${question}

Candidate Answer:
${userAnswer}

Respond in JSON format with feedback AND a numeric score.

Return ONLY valid JSON (no other text):
{
  "feedback": "Your conversational response as an interviewer",
  "score": <number between 0-10>,
  "strengths": ["specific strength 1", "specific strength 2"],
  "improvements": ["specific improvement 1"]
}

Rules:
- feedback should be 2-3 short sentences, conversational like you're speaking
- score should reflect answer quality (0-10)
- Be encouraging but honest
`;

  const content = await makeRequest(prompt, MODEL, 0.3);
  
  try {
    const parsed = parseJSON(content);
    return {
      feedback: parsed.feedback || "Thanks for your answer.",
      score: typeof parsed.score === 'number' ? Math.min(10, Math.max(0, parsed.score)) : 5,
      strengths: parsed.strengths || [],
      improvements: parsed.improvements || []
    };
  } catch (error) {
    return {
      feedback: content || "Thanks for your answer. Let's move to the next question.",
      score: 5,
      strengths: [],
      improvements: []
    };
  }
};

export const generateFollowUp = async ({ question, userAnswer }) => {
  const prompt = `
You are a technical interviewer.

Original Question:
${question}

Candidate Answer:
${userAnswer}

Ask ONE natural follow-up interview question based on the candidate's answer.

Rules:
- It should probe deeper understanding
- It should sound like a real interviewer
- Only return the follow-up question text
`;

  const content = await makeRequest(prompt, MODEL, 0.7);
  return content.trim();
};

/* ================= CANDIDATE Q&A PHASE ================= */

export const generateCandidateQAAnswers = async ({ company, role, type }) => {
  const prompt = `
You are a ${role} at ${company}.
Generate 3-4 common questions candidates ask in interviews, with realistic answers.

Common topics: team size, tech stack, work-life balance, growth opportunities, engineering culture, daily responsibilities

Rules:
- Answers should be authentic and realistic
- Keep answers 1-2 sentences
- Sound like a real employee, not corporate

Return ONLY JSON:
[
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."},
  {"question": "...", "answer": "..."}
]`;

  const content = await makeRequest(prompt, MODEL, 0.6);
  return parseJSON(content);
};

/* ================= CLOSING PHASE ================= */

export const generateClosingMessage = async ({ 
  candidateName, 
  overallScore,
  interviewerName 
}) => {
  const prompt = `
You are ${interviewerName}, wrapping up a mock interview.
The candidate scored ${overallScore}/100 overall.

Generate a natural closing message that:
- Is warm and friendly
- Gives vague realistic timeline ("we'll be in touch within a week")
- Doesn't reveal the score
- Thanks them for their time

Keep it very short (2-3 sentences).`;

  const content = await makeRequest(prompt, MODEL, 0.5);
  return content.trim();
};

/* ================= OVERALL FEEDBACK ================= */

export const generateOverallFeedback = async ({ questions, scores, type, company }) => {
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  const prompt = `A candidate completed a ${type} technical interview at ${company}.

Average Score: ${avg}/10
Total Questions: ${questions.length}

Return ONLY JSON:

{
 "assessment":"Overall evaluation",
 "strengths":["..."],
 "improvements":["..."],
 "recommendations":["..."]
}`;

  const content = await makeRequest(prompt, MODEL, 0.4);
  return parseJSON(content);
};

/* ================= AI TOPIC EXPLANATION ================= */

export const explainTopic = async ({ topic, subject }) => {
  const prompt = `Explain the topic "${topic}" from ${subject} for interview preparation.

Include:
- Key concepts
- Simple explanation
- Important interview points

Limit response to 200-300 words.`;

  const content = await makeRequest(prompt, MODEL, 0.5);
  return content.trim();
};

