import { z } from 'zod';
import { Quiz, QuizQuestion, QuizAttempt } from '../db/schema';
import { getGeminiClient, generateContentWithRetry, safeParseJson } from './gemini';
import { db } from '../db/database';

export interface GenerateQuizParams {
  userId: string;
  topic: string;
  subject: string;
  language: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  questionCount: 5 | 10 | 15;
  type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'MIXED';
}

export interface SubmitQuizAnswerPayload {
  questionId: string;
  userAnswer: string;
}

export class QuizEngineService {
  public static async generateQuiz(params: GenerateQuizParams): Promise<Quiz> {
    const { userId, topic, subject, language, difficulty, questionCount, type } = params;
    const ai = getGeminiClient();

    let questions: QuizQuestion[] = [];

    if (ai) {
      try {
        const prompt = `You are an expert Computer Science professor generating a quiz for B.Tech students.
Subject: ${subject}
Topic: ${topic}
Target Language: ${language}
Difficulty Level: ${difficulty}
Total Questions Needed: ${questionCount}
Question Format: ${type} (Options: MCQ, TRUE_FALSE, SHORT_ANSWER, or MIXED)

CRITICAL INSTRUCTIONS:
1. All questions, options, and explanations must be written in ${language}, while preserving standard technical English terminology (e.g. Stack, CPU, Pointers, Deadlock, B-Tree, TCP).
2. If MCQ: provide 4 distinct options (A, B, C, D) and specify exact correctAnswer (one of the 4 choices).
3. If TRUE_FALSE: provide "True" and "False" in options, specify correctAnswer ("True" or "False").
4. If SHORT_ANSWER: provide a 1-sentence reference answer in correctAnswer.
5. Provide a clear educational explanation in ${language} for why the correct answer is right.

Return a JSON array of questions with this schema:
[
  {
    "id": "q1",
    "question": "Question text in ${language}",
    "type": "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Exact text of correct option",
    "explanation": "Clear explanation in ${language}",
    "topic": "${topic}",
    "difficulty": "${difficulty}"
  }
]`;

        const { response: result } = await generateContentWithRetry({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const raw = result.text || '[]';
        const parsed = safeParseJson(raw, []);
        if (Array.isArray(parsed) && parsed.length > 0) {
          questions = parsed.map((q, idx) => ({
            id: `q_${Date.now()}_${idx + 1}`,
            question: q.question,
            type: q.type || 'MCQ',
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || '',
            topic: q.topic || topic,
            difficulty,
          }));
        }
      } catch (err: any) {
        console.warn('Quiz generation LLM API call encountered issue, generating native fallback quiz:', err.message || err);
      }
    }

    // If questions array is empty (no API key or parse error), provide high-quality fallback questions
    if (questions.length === 0) {
      questions = QuizEngineService.generateFallbackQuestions(
        topic,
        subject,
        language,
        difficulty,
        questionCount,
        type
      );
    }

    const quiz: Quiz = {
      id: 'quiz_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userId,
      topic,
      subject,
      language,
      difficulty,
      questionCount: questions.length,
      type,
      questions,
      createdAt: new Date().toISOString(),
    };

    return db.saveQuiz(quiz);
  }

  public static async gradeAttempt(
    quizId: string,
    userId: string,
    submissions: SubmitQuizAnswerPayload[]
  ): Promise<QuizAttempt> {
    const quiz = db.getQuizById(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    const ai = getGeminiClient();
    const gradedAnswers: QuizAttempt['answers'] = [];
    const weakTopicSet = new Set<string>();
    let correctCount = 0;

    for (const sub of submissions) {
      const q = quiz.questions.find((quest) => quest.id === sub.questionId);
      if (!q) continue;

      const userAns = (sub.userAnswer || '').trim();
      let isCorrect = false;

      if (q.type === 'MCQ' || q.type === 'TRUE_FALSE') {
        isCorrect =
          userAns.toLowerCase() === q.correctAnswer.trim().toLowerCase() ||
          userAns.replace(/^[A-D]\)\s*/i, '').trim().toLowerCase() ===
            q.correctAnswer.replace(/^[A-D]\)\s*/i, '').trim().toLowerCase();
      } else {
        // Short answer semantic evaluation
        isCorrect = await QuizEngineService.evaluateShortAnswer(userAns, q.correctAnswer, q.question, ai);
      }

      if (isCorrect) {
        correctCount += 1;
      } else {
        weakTopicSet.add(q.topic);
      }

      gradedAnswers.push({
        questionId: q.id,
        questionText: q.question,
        userAnswer: sub.userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      });
    }

    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((correctCount / (totalQuestions || 1)) * 100);

    const attempt: QuizAttempt = {
      id: 'attempt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      quizId: quiz.id,
      userId,
      topic: quiz.topic,
      subject: quiz.subject,
      language: quiz.language,
      score: correctCount,
      totalQuestions,
      percentage,
      answers: gradedAnswers,
      weakTopics: Array.from(weakTopicSet),
      createdAt: new Date().toISOString(),
    };

    return db.saveQuizAttempt(attempt);
  }

  private static async evaluateShortAnswer(
    userAnswer: string,
    referenceAnswer: string,
    questionText: string,
    ai: any
  ): Promise<boolean> {
    if (!userAnswer || userAnswer.length < 2) return false;

    // Fast heuristic match
    const normUser = userAnswer.toLowerCase();
    const normRef = referenceAnswer.toLowerCase();
    if (normUser === normRef || normRef.includes(normUser) || normUser.includes(normRef)) {
      return true;
    }

    // Token overlap
    const refTokens = normRef.split(/\s+/).filter((w) => w.length > 3);
    const userTokens = normUser.split(/\s+/).filter((w) => w.length > 3);
    const matched = refTokens.filter((t) => userTokens.includes(t));
    if (refTokens.length > 0 && matched.length / refTokens.length >= 0.5) {
      return true;
    }

    // If AI is available, use semantic grading
    if (ai) {
      try {
        const prompt = `Grade this technical Computer Science student's short answer.
Question: "${questionText}"
Reference Answer: "${referenceAnswer}"
Student's Answer: "${userAnswer}"

Accept correct paraphrases, conceptual synonyms, and answers in Indian languages (Hindi, Telugu, Tamil, etc.). Reject factually incorrect answers.
Output ONLY JSON: {"isCorrect": true | false}`;

        const { response: res } = await generateContentWithRetry({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });
        const parsed = safeParseJson(res.text || '{}', { isCorrect: false });
        return Boolean(parsed.isCorrect);
      } catch (err: any) {
        console.warn('Short answer evaluation LLM call encountered issue:', err.message || err);
        return matched.length > 0;
      }
    }

    return matched.length > 0;
  }

  private static generateFallbackQuestions(
    topic: string,
    subject: string,
    language: string,
    difficulty: string,
    count: number,
    format: string
  ): QuizQuestion[] {
    const list: QuizQuestion[] = [];
    const isTelugu = language.toLowerCase().includes('telugu');
    const isHindi = language.toLowerCase().includes('hindi');

    const templates = [
      {
        questionEn: `What is the primary role of ${topic} in ${subject}?`,
        questionTe: `${subject} లో ${topic} యొక్క ప్రాథమిక ప్రయోజనం ఏమిటి?`,
        questionHi: `${subject} में ${topic} की मुख्य भूमिका क्या है?`,
        optionsEn: [
          `Optimizes system resource allocation and performance`,
          `Translates source code to assembly code`,
          `Formats hard disk drive partitions`,
          `Disconnects active network connections`,
        ],
        optionsTe: [
          `సిస్టమ్ వనరుల కేటాయింపు మరియు పనితీరును ఆప్టిమైజ్ చేస్తుంది`,
          `సోర్స్ కోడ్‌ను అసెంబ్లీ కోడ్‌లోకి అనువదిస్తుంది`,
          `హార్డ్ డిస్క్ డ్రైవ్ విభజనలను ఫార్మాట్ చేస్తుంది`,
          `యాక్టివ్ నెట్‌వర్క్ కనెక్షన్‌లను డిస్‌కనెక్ట్ చేస్తుంది`,
        ],
        optionsHi: [
          `सिस्टम रिसोर्स आवंटन और प्रदर्शन को अनुकूलित करता है`,
          `सोर्स कोड को असेंबली में बदलता है`,
          `हार्ड ड्राइव पार्टीशन को फॉर्मेट करता है`,
          `सक्रिय नेटवर्क कनेक्शन को डिस्कनेक्ट करता है`,
        ],
        correctIndex: 0,
        explanationEn: `${topic} manages critical system constraints and ensures high operational efficiency.`,
        explanationTe: `${topic} సిస్టమ్ సామర్థ్యాన్ని పెంచి సమర్థవంతమైన నిర్వహణను అందిస్తుంది.`,
        explanationHi: `${topic} सिस्टम दक्षता को बढ़ाता है और कुशल निष्पादन सुनिश्चित करता है।`,
      },
      {
        questionEn: `Which condition must be prevented to avoid Deadlock during ${topic}?`,
        questionTe: `${topic} నిర్వహణలో Deadlock రాకుండా ఉండాలంటే ఏ షరతును నివారించాలి?`,
        questionHi: `${topic} के दौरान डेडलॉक से बचने के लिए किस स्थिति को रोका जाना चाहिए?`,
        optionsEn: ['Circular Wait', 'Linear Search', 'Binary Paging', 'CPU Throttling'],
        optionsTe: ['Circular Wait (వృత్తాకార నిరీక్షణ)', 'Linear Search', 'Binary Paging', 'CPU Throttling'],
        optionsHi: ['Circular Wait (सर्कुलर वेट)', 'Linear Search', 'Binary Paging', 'CPU Throttling'],
        correctIndex: 0,
        explanationEn: `Circular wait is one of Coffman's four mandatory conditions for deadlock.`,
        explanationTe: `Circular Wait అనేది Deadlock కు దారితీసే కాఫ్‌మన్ నాలుగు షరతులలో ఒకటి.`,
        explanationHi: `सर्कुलर वेट डेडलॉक की चार अनिवार्य स्थितियों में से एक है।`,
      },
      {
        questionEn: `True or False: In ${subject}, technical terms like "${topic}" should be preserved without forced literal translations.`,
        questionTe: `నిజమా లేదా అబద్ధమా: ${subject} లో "${topic}" వంటి సాంకేతిక పదాలను అక్షరాలా అనువదించకుండా అలాగే ఉంచాలి.`,
        questionHi: `सत्य या असत्य: ${subject} में "${topic}" जैसे तकनीकी शब्दों का शाब्दिक अनुवाद करने के बजाय मूल रूप में रखना चाहिए।`,
        optionsEn: ['True', 'False'],
        optionsTe: ['True (నిజం)', 'False (అబద్ధం)'],
        optionsHi: ['True (सत्य)', 'False (असत्य)'],
        correctIndex: 0,
        explanationEn: `Preserving technical terminology maintains semantic precision and prevents confusion.`,
        explanationTe: `సాంకేతిక పదాలను కాపాడటం ద్వారా సరైన ఇంజనీరింగ్ భావం సురక్షితంగా ఉంటుంది.`,
        explanationHi: `तकनीकी शब्दावली को मूल रूप में रखने से सही अर्थ बना रहता है।`,
      },
      {
        questionEn: `What is the asymptotic time complexity commonly associated with optimal search in ${topic}?`,
        questionTe: `${topic} లో ఆప్టిమల్ శోధనకు సంబంధించిన టైమ్ కాంప్లెక్సిటీ ఎంత?`,
        questionHi: `${topic} में सर्वोत्तम खोज की समय जटिलता (Time Complexity) क्या है?`,
        optionsEn: ['O(log N)', 'O(N^3)', 'O(2^N)', 'O(N!)'],
        optionsTe: ['O(log N)', 'O(N^3)', 'O(2^N)', 'O(N!)'],
        optionsHi: ['O(log N)', 'O(N^3)', 'O(2^N)', 'O(N!)'],
        correctIndex: 0,
        explanationEn: `Logarithmic time O(log N) indicates balanced divide-and-conquer efficiency.`,
        explanationTe: `O(log N) సమర్థవంతమైన విభజించి శోధించే విధానాన్ని సూచిస్తుంది.`,
        explanationHi: `O(log N) संतुलित डिवाइड-एंड-कॉन्कर दक्षता को दर्शाता है।`,
      },
      {
        questionEn: `Which data structure is primarily utilized for managing states in ${topic}?`,
        questionTe: `${topic} లో స్టేట్స్ నిర్వహణకు ప్రధానంగా ఏ Data Structure ఉపయోగిస్తారు?`,
        questionHi: `${topic} में स्टेट्स प्रबंधित करने के लिए मुख्य रूप से कौन सी डेटा संरचना का उपयोग किया जाता है?`,
        optionsEn: ['Queue / Priority Queue', 'Singly Linked List', 'Static Array', 'Unsorted Tuple'],
        optionsTe: ['Queue / Priority Queue', 'Singly Linked List', 'Static Array', 'Unsorted Tuple'],
        optionsHi: ['Queue / Priority Queue', 'Singly Linked List', 'Static Array', 'Unsorted Tuple'],
        correctIndex: 0,
        explanationEn: `Queues enforce order (FIFO or prioritized execution) for reliable processing.`,
        explanationTe: `Queue ఖచ్చితమైన క్రమంలో పనులను ప్రాసెస్ చేయడానికి ఉపయోగపడుతుంది.`,
        explanationHi: `क्यू कार्यों को क्रमबद्ध रूप से निष्पादित करने में मदद करता है।`,
      },
    ];

    for (let i = 0; i < count; i++) {
      const tmpl = templates[i % templates.length];
      const isTrueFalse = format === 'TRUE_FALSE' || (format === 'MIXED' && i % 3 === 1);
      const isShortAnswer = format === 'SHORT_ANSWER' || (format === 'MIXED' && i % 3 === 2);

      let qText = tmpl.questionEn;
      let opts = tmpl.optionsEn;
      let expl = tmpl.explanationEn;

      if (isTelugu) {
        qText = tmpl.questionTe;
        opts = tmpl.optionsTe;
        expl = tmpl.explanationTe;
      } else if (isHindi) {
        qText = tmpl.questionHi;
        opts = tmpl.optionsHi;
        expl = tmpl.explanationHi;
      }

      if (isTrueFalse) {
        list.push({
          id: `q_fb_${Date.now()}_${i + 1}`,
          question: qText + (isTelugu ? ' (నిజమా/అబద్ధమా?)' : isHindi ? ' (सत्य/असत्य?)' : ' (True or False?)'),
          type: 'TRUE_FALSE',
          options: isTelugu ? ['True (నిజం)', 'False (అబద్ధం)'] : isHindi ? ['True (सत्य)', 'False (असत्य)'] : ['True', 'False'],
          correctAnswer: isTelugu ? 'True (నిజం)' : isHindi ? 'True (सत्य)' : 'True',
          explanation: expl,
          topic,
          difficulty: difficulty as any,
        });
      } else if (isShortAnswer) {
        list.push({
          id: `q_fb_${Date.now()}_${i + 1}`,
          question: qText,
          type: 'SHORT_ANSWER',
          correctAnswer: opts[tmpl.correctIndex],
          explanation: expl,
          topic,
          difficulty: difficulty as any,
        });
      } else {
        list.push({
          id: `q_fb_${Date.now()}_${i + 1}`,
          question: qText,
          type: 'MCQ',
          options: opts,
          correctAnswer: opts[tmpl.correctIndex],
          explanation: expl,
          topic,
          difficulty: difficulty as any,
        });
      }
    }

    return list;
  }
}
