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
const GOOGLE_MODEL = process.env.GOOGLE_AI_MODEL || "gemini-1.5-pro";
const GOOGLE_API_KEY = process.env.GOOGLE_AI_API_KEY || process.env.Google_AI_api_key;

if (!GOOGLE_API_KEY) {
  console.warn("Google AI API key is not configured. Secondary reasoning provider disabled.");
}

const INTERVIEWER_SYSTEM_PROMPT = `
You are a professional interviewer conducting a realistic mock interview.

Rules:
- Stay in interviewer mode at all times
- Be concise, clear, structured, and highly relevant
- Keep responses short (max 2-3 lines unless JSON is requested)
- Ask one question at a time
- Be professional, slightly strict, and realistic
- Challenge vague answers with focused follow-ups
- Do not mention being an AI assistant
- Do not provide long explanations unless explicitly asked
`;

const normalizeInterviewType = (type = "") => {
  const t = String(type).toLowerCase();
  if (t.includes("system")) return "SYSTEM_DESIGN";
  if (t.includes("behavior")) return "HR";
  return "DSA";
};

const toResumeData = (resumeText = "") => {
  const raw = String(resumeText || "").trim();
  if (!raw) return null;

  const clipped = raw.slice(0, 4000);
  const lines = clipped
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const projectHints = lines
    .filter((line) => /(project|built|developed|implemented|designed|deployed|architecture)/i.test(line))
    .slice(0, 8);

  return {
    raw_text: clipped,
    project_hints: projectHints
  };
};

const buildInputContext = ({
  interviewType,
  difficulty,
  resumeText,
  previousAnswers = []
}) => {
  return JSON.stringify(
    {
      interview_type: normalizeInterviewType(interviewType),
      difficulty: String(difficulty || "MEDIUM").toUpperCase(),
      resume_data: toResumeData(resumeText),
      previous_answers: previousAnswers
    },
    null,
    2
  );
};

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

const makeGroqRequest = async (
  prompt,
  model = MODEL,
  temperature = 0.7,
  systemPrompt = ""
) => {
  if (!groq) {
    throw new Error("AI service not configured. Please set GROQ_API_KEY in .env file.");
  }
  
  try {
    const messages = systemPrompt
      ? [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ]
      : [{ role: "user", content: prompt }];

    const response = await groq.chat.completions.create({
      model: model,
      messages,
      temperature: temperature,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Groq API Error:", error.message);
    throw error;
  }
};

const makeGoogleRequest = async (
  prompt,
  temperature = 0.4,
  systemPrompt = "",
  model = GOOGLE_MODEL
) => {
  if (!GOOGLE_API_KEY) {
    throw new Error("Google AI API key is missing. Set GOOGLE_AI_API_KEY or Google_AI_api_key in .env.");
  }

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      topP: 0.9,
      topK: 40
    }
  };

  if (systemPrompt) {
    payload.systemInstruction = {
      role: "system",
      parts: [{ text: systemPrompt }]
    };
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Google AI API Error: ${response.status} ${details.slice(0, 240)}`);
  }

  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const content = parts
    .map((part) => part?.text || "")
    .join("\n")
    .trim();

  if (!content) {
    throw new Error("Google AI returned empty content");
  }

  return content;
};

const makeRequest = async (
  prompt,
  model = MODEL,
  temperature = 0.7,
  systemPrompt = "",
  options = {}
) => {
  const provider = options.provider || "groq";
  const fallbackProvider = options.fallbackProvider || (provider === "groq" ? "google" : "groq");
  const allowFallback = options.allowFallback !== false;

  const runProvider = async (targetProvider) => {
    if (targetProvider === "google") {
      return makeGoogleRequest(prompt, temperature, systemPrompt, options.googleModel || GOOGLE_MODEL);
    }
    return makeGroqRequest(prompt, model, temperature, systemPrompt);
  };

  try {
    return await runProvider(provider);
  } catch (primaryError) {
    if (!allowFallback || fallbackProvider === provider) {
      throw primaryError;
    }

    console.warn(`Primary provider (${provider}) failed. Falling back to ${fallbackProvider}.`, primaryError.message);
    return runProvider(fallbackProvider);
  }
};

const makeReasoningRequest = (prompt, temperature = 0.4, systemPrompt = INTERVIEWER_SYSTEM_PROMPT) =>
  makeRequest(prompt, MODEL, temperature, systemPrompt, {
    provider: "google",
    fallbackProvider: "groq"
  });

const buildResumeReasoningSummary = async (resumeText = "") => {
  const resumeData = toResumeData(resumeText);
  if (!resumeData) return null;

  const prompt = `Analyze this resume data for interview planning.

Resume data:
${JSON.stringify(resumeData, null, 2)}

Return ONLY JSON:
{
  "focusAreas": ["3-5 key topics to assess"],
  "projectDeepDives": ["2-4 practical deep-dive angles"],
  "riskAreas": ["possible weak spots to probe"]
}`;

  try {
    const content = await makeReasoningRequest(prompt, 0.2, INTERVIEWER_SYSTEM_PROMPT);
    return parseJSON(content);
  } catch (error) {
    console.warn("Resume reasoning summary generation failed:", error.message);
    return null;
  }
};

/* ================= GENERATE QUESTIONS ================= */

export const generateQuestions = async ({
  type,
  company,
  difficulty,
  count = 5,
  resumeText = ""
}) => {
  const resumeReasoning = await buildResumeReasoningSummary(resumeText);

  const inputContext = buildInputContext({
    interviewType: type,
    difficulty,
    resumeText,
    previousAnswers: []
  });

  const prompt = `You are selecting interview questions.

Input context:
${inputContext}

Secondary reasoning insights:
${resumeReasoning ? JSON.stringify(resumeReasoning, null, 2) : "None"}

Selection logic:
- If resume_data exists, prioritize:
  1) Project-based practical questions
  2) Resume skills
  3) Core fundamentals
  4) Advanced stretch questions
- If secondary reasoning insights exist, use focusAreas/projectDeepDives before generic questions
- If resume_data is missing, use interview_type and difficulty only
- Keep each question concise and realistic
- Ask practical, non-generic questions

Special handling:
- For DSA: include clear problem framing
- For SYSTEM_DESIGN: ask architecture/trade-off questions
- For HR: ask realistic behavioral questions

Return exactly ${count} questions.

Return ONLY JSON:
[{"question":"...", "expectedPoints":["point1","point2"], "questionType":"technical|behavioral|system-design|dsa"}]`;

  const content = await makeRequest(prompt, MODEL, 0.35, INTERVIEWER_SYSTEM_PROMPT);
  return parseJSON(content);
};

/* ================= WARM-UP PHASE FUNCTIONS ================= */

export const generateWarmUpGreeting = async ({ interviewerName, company, resumeText = "" }) => {
  const inputContext = buildInputContext({
    interviewType: "HR",
    difficulty: "EASY",
    resumeText,
    previousAnswers: []
  });

  const prompt = `
You are ${interviewerName}, a professional interviewer at ${company}.

Input context:
${inputContext}

Create a short interview opening.

Rules:
- Keep it to 1-2 short lines
- If resume_data exists, naturally reference one project/skill
- Ask one opening question only
- Keep tone professional and realistic

Return ONLY JSON:
{"greeting": "...", "followUp": "..."}`;

  const content = await makeRequest(prompt, MODEL, 0.3, INTERVIEWER_SYSTEM_PROMPT);
  return parseJSON(content);
};

export const generateWarmUpResponse = async ({ 
  userResponse, 
  interviewerName, 
  company,
  resumeText = ""
}) => {
  const inputContext = buildInputContext({
    interviewType: "HR",
    difficulty: "EASY",
    resumeText,
    previousAnswers: [userResponse]
  });

  const prompt = `
You are ${interviewerName}, a professional interviewer at ${company}.

Input context:
${inputContext}

The candidate just said: "${userResponse}"

Generate a short response that:
- Acknowledges what they said
- Transitions to interview mode quickly
- Keeps response concise and focused

Return ONLY JSON:
{"response": "...", "readyToMoveOn": true|false}`;

  const content = await makeRequest(prompt, MODEL, 0.3, INTERVIEWER_SYSTEM_PROMPT);
  return parseJSON(content);
};

export const generateBackgroundQuestions = async (resumeText = "") => {
  const inputContext = buildInputContext({
    interviewType: "HR",
    difficulty: "MEDIUM",
    resumeText,
    previousAnswers: []
  });

  const prompt = `
Generate 2-3 resume/background interview questions.

Input context:
${inputContext}

Rules:
- If resume_data exists, prioritize:
  1) project-based practical question
  2) skills/decision-making question
  3) transition question into technical round
- Avoid generic theory-heavy questions
- Keep each question concise and interviewer-like

Return ONLY JSON:
[{"question": "...", "context": "what to mention before asking"}]`;

  const content = await makeReasoningRequest(prompt, 0.35, INTERVIEWER_SYSTEM_PROMPT);
  return parseJSON(content);
};

export const generateBackgroundResponse = async ({
  question,
  userResponse,
  interviewerName,
  resumeText = ""
}) => {
  const inputContext = buildInputContext({
    interviewType: "HR",
    difficulty: "MEDIUM",
    resumeText,
    previousAnswers: [userResponse]
  });

  const prompt = `
You are ${interviewerName}, a technical interviewer.

Input context:
${inputContext}

The candidate answered this background question:
Question: "${question}"
Answer: "${userResponse}"

Generate a natural response that:
- Is concise and focused
- Challenges vague claims with one short clarification
- Asks one practical follow-up question when useful

Return ONLY JSON:
{"response": "...", "followUpQuestion": "...", "shouldAskFollowUp": true|false}`;

  const content = await makeReasoningRequest(prompt, 0.3, INTERVIEWER_SYSTEM_PROMPT);
  return parseJSON(content);
};

/* ================= CORE QUESTIONS ================= */

export const evaluateAnswer = async ({ question, userAnswer }) => {
  const prompt = `
You are evaluating one candidate answer as a professional interviewer.

Question:
${question}

Candidate Answer:
${userAnswer}

Respond in JSON format with short interviewer feedback and internal scoring.

Return ONLY valid JSON (no other text):
{
  "feedback": "Short interviewer response (1-2 lines)",
  "score": <number between 0-10>,
  "strengths": ["specific strength 1", "specific strength 2"],
  "improvements": ["specific improvement 1"]
}

Rules:
- Keep feedback concise and relevant
- Do not provide long explanations
- Score should reflect correctness, depth, and clarity
`;

  const content = await makeRequest(prompt, MODEL, 0.2, INTERVIEWER_SYSTEM_PROMPT);
  
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
- Keep it short and focused
- Only return the follow-up question text
`;

  const content = await makeRequest(prompt, MODEL, 0.35, INTERVIEWER_SYSTEM_PROMPT);
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

/* ================= DYNAMIC FOLLOW-UPS & PROBING ================= */

export const generateProbeFollowUp = async ({
  question,
  userAnswer,
  answerLength,
  previousScore,
  interviewType = "DSA",
  difficulty = "MEDIUM",
  resumeText = "",
  previousAnswers = []
}) => {
  const inputContext = buildInputContext({
    interviewType,
    difficulty,
    resumeText,
    previousAnswers
  });

  const prompt = `You are a technical interviewer.

Input context:
${inputContext}

Original Question: "${question}"
Candidate's Answer: "${userAnswer}"
Answer Word Count: ${answerLength}

The answer quality is ${previousScore < 5 ? "weak/incomplete" : previousScore >= 7 ? "strong" : "moderate"}.

Generate EXACTLY ONE follow-up question.

Rules:
- If weak answer: simplify and probe fundamentals
- If strong answer: increase difficulty slightly (trade-offs/edge cases/optimization)
- Keep it concise and interviewer-like
- Ask only one question

Return ONLY JSON:
{"followUp": "...", "type": "clarification|deeper_dive|edge_case"}`;

  const content = await makeRequest(prompt, MODEL, 0.35, INTERVIEWER_SYSTEM_PROMPT);
  return parseJSON(content);
};

export const generateInterrupterResponse = async ({
  question,
  userAnswer,
  interviewerName
}) => {
  const prompt = `You are ${interviewerName}, a technical interviewer.

Question Asked: "${question}"
Candidate Started Answering: "${userAnswer.substring(0, 100)}..."

Generate a natural interruption that:
- Cuts them off politely ("Okay, let me stop you there...")
- Asks for clarification or wants to go deeper
- Feels like a real interview moment
- Is 1 sentence only

Return ONLY JSON:
{"interruption": "...", "reason": "too_general|too_long|missing_detail"}`;

  const content = await makeRequest(prompt, MODEL, 0.35, INTERVIEWER_SYSTEM_PROMPT);
  return parseJSON(content);
};

export const generateAdaptiveQuestion = async ({
  previousScore,
  topic,
  difficulty,
  resumeText = ""
}) => {
  const nextDifficulty = previousScore >= 7 ? "harder" : previousScore >= 4 ? "same" : "easier";

  const inputContext = buildInputContext({
    interviewType: topic,
    difficulty,
    resumeText,
    previousAnswers: []
  });

  const prompt = `Generate one ${nextDifficulty} ${topic} interview question for a ${difficulty} interview.

Input context:
${inputContext}

Rules:
- If ${nextDifficulty}, add more complexity or edge cases
- If easier, focus on fundamentals
- Keep the language natural
- Sound like a real interviewer would ask it

Return ONLY JSON:
{"question": "...", "expectedPoints": ["point1", "point2"], "difficulty": "${nextDifficulty}"}`;

  const content = await makeRequest(prompt, MODEL, 0.35, INTERVIEWER_SYSTEM_PROMPT);
  return parseJSON(content);
};

export const generateInterviewerReaction = async ({
  answerQuality,
  answerLength,
  isFollowUp
}) => {
  const prompt = `Generate a brief, realistic interviewer reaction for a ${answerQuality} answer that is ${answerLength} ${isFollowUp ? "(to a follow-up)" : ""}.

Options: positive reaction, skeptical, thinking, satisfied, wanting more info

Return ONLY JSON:
{"reaction": "one of: thinking|satisfied|intrigued|skeptical|impressed", "audioClue": "umm...|interesting...|i see...|hm|yeah", "bodylanguage": "nodding|typing_notes|leaning_back|pursed_lips"}`;

  const content = await makeRequest(prompt, MODEL, 0.3, INTERVIEWER_SYSTEM_PROMPT);
  return parseJSON(content);
};

/* ================= OVERALL FEEDBACK ================= */

export const generateOverallFeedback = async ({ questions, scores, type, company }) => {
  const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  const prompt = `A candidate completed a ${type} technical interview at ${company}.

Average Score: ${avg}/10
Total Questions: ${questions.length}

Question and answer snapshots:
${JSON.stringify(
    questions.map((q) => ({
      question: q.question,
      answer: q.userAnswer,
      score: q.score
    })),
    null,
    2
  )}

Return ONLY JSON:

{
 "strengths":["..."],
 "weaknesses":["..."],
 "improvements":["..."],
 "scores":{
   "technical":"x/10",
   "communication":"x/10",
   "problem_solving":"x/10",
   "confidence":"x/10",
   "overall":"x/10"
 }
}`;

  const content = await makeReasoningRequest(prompt, 0.25, INTERVIEWER_SYSTEM_PROMPT);
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

  const content = await makeReasoningRequest(prompt, 0.5);
  return content.trim();
};

