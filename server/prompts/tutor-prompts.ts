import { Terminology, FewShotExample, Message } from '../db/schema';

export interface PromptBuildParams {
  question: string;
  sourceLanguage: string;
  targetLanguage: string;
  subject: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  relevantTerms: Terminology[];
  fewShotExamples: FewShotExample[];
  conversationHistory: Message[];
  actionType?: 'DEFAULT' | 'SIMPLIFY' | 'EXPLAIN_DEEPER' | 'GIVE_EXAMPLE' | 'ANALOGY' | 'TRANSLATE';
  extraInstruction?: string;
}

export function buildContextAwareSystemInstruction(
  targetLanguage: string,
  subject: string,
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
): string {
  return `You are LinguaLearn, an expert multilingual AI educational assistant and computer science professor specializing in ${subject}.
Your core mission is to explain technical concepts to B.Tech and Computer Science students in their preferred language (${targetLanguage}) while STRICTLY PRESERVING technical meaning and terminology.

CRITICAL LINGUISTIC & TERMINOLOGICAL RULES:
1. TERMINOLOGY PRESERVATION: DO NOT force literal translations of standard technical terms (e.g., Thread, Stack, Deadlock, Socket, Mutex, API, Compiler, Overfitting, Cache, Hash Table).
   - In ${targetLanguage}, keep standard terms in English or natural transliteration.
   - Explain the concept using ${targetLanguage} grammatical structure, but keep the technical keywords preserved.
2. ADAPTIVE DIFFICULTY (${difficulty}):
   - BEGINNER: Use everyday relatable analogies, clear simple vocabulary, short sentences, and beginner-friendly examples.
   - INTERMEDIATE: Use standard technical vocabulary, clear operational diagrams/steps, moderate depth, and practical code/logic examples.
   - ADVANCED: Precise algorithmic mechanics, formal definitions, time/space complexities, edge cases, and deep architectural mechanisms.
3. EDUCATIONAL STRUCTURE:
   - Provide a concise definition.
   - A direct quick answer.
   - A thorough, lucid explanation in ${targetLanguage}.
   - A vivid real-world analogy.
   - A practical code/technical example.
   - Clear step-by-step mechanism.
   - Key takeaway points.
   - List of technical terms with preserved status and meanings.
   - Common student misconceptions to watch out for.

OUTPUT FORMAT:
You MUST respond with valid JSON matching the exact schema requested. Do not include markdown code block backticks unless strictly returning valid JSON.`;
}

export function buildTutorPrompt(params: PromptBuildParams): string {
  const {
    question,
    sourceLanguage,
    targetLanguage,
    subject,
    difficulty,
    relevantTerms,
    fewShotExamples,
    conversationHistory,
    actionType,
    extraInstruction,
  } = params;

  let prompt = `=== LINGUALEARN CONTEXT-AWARE GENERATION REQUEST ===\n`;
  prompt += `Student Question: "${question}"\n`;
  prompt += `Source Language: ${sourceLanguage}\n`;
  prompt += `Target Language: ${targetLanguage}\n`;
  prompt += `Subject Domain: ${subject}\n`;
  prompt += `Target Difficulty Level: ${difficulty}\n\n`;

  if (actionType && actionType !== 'DEFAULT') {
    prompt += `SPECIFIC STUDENT ACTION: ${actionType}\n`;
    if (actionType === 'SIMPLIFY') {
      prompt += `-> Student requested: Simplify this explanation further. Use an even simpler analogy and break down complex words.\n`;
    } else if (actionType === 'EXPLAIN_DEEPER') {
      prompt += `-> Student requested: Explain deeper into the underlying architecture, algorithmic mechanisms, and internal memory/CPU behavior.\n`;
    } else if (actionType === 'GIVE_EXAMPLE') {
      prompt += `-> Student requested: Provide another vivid, concrete code or real-world system example in ${targetLanguage}.\n`;
    } else if (actionType === 'ANALOGY') {
      prompt += `-> Student requested: Provide a memorable cultural or daily-life analogy in ${targetLanguage}.\n`;
    }
  }

  if (extraInstruction) {
    prompt += `Additional Context: ${extraInstruction}\n\n`;
  }

  // Inject Terminology Preservation Rules
  if (relevantTerms.length > 0) {
    prompt += `--- PRESERVED TECHNICAL TERMINOLOGY RULES ---\n`;
    for (const t of relevantTerms) {
      prompt += `- English Term: "${t.englishTerm}"\n`;
      prompt += `  Preferred in ${targetLanguage}: ${t.preferredTranslation}\n`;
      prompt += `  Do Not Translate Literally: ${t.doNotTranslate ? 'YES (CRITICAL)' : 'NO'}\n`;
      prompt += `  Guidance: ${t.explanation}\n`;
    }
    prompt += `\n`;
  }

  // Inject Relevant Few-Shot Examples
  if (fewShotExamples.length > 0) {
    prompt += `--- FEW-SHOT DEMONSTRATION EXAMPLES ---\n`;
    for (const ex of fewShotExamples) {
      prompt += `[Example: ${ex.sourceLanguage} -> ${ex.targetLanguage} | ${ex.subject} (${ex.difficulty})]\n`;
      prompt += `Question: ${ex.question}\n`;
      prompt += `Guidance: ${ex.terminologyGuidance}\n`;
      prompt += `Sample Style Snippet: ${ex.responseSnippet}\n\n`;
    }
  }

  // Recent Conversation Context
  if (conversationHistory.length > 0) {
    prompt += `--- RECENT CONVERSATION CONTEXT (last 3 messages) ---\n`;
    const recent = conversationHistory.slice(-3);
    for (const msg of recent) {
      prompt += `${msg.sender === 'user' ? 'Student' : 'AI Tutor'}: ${msg.content.slice(0, 300)}\n`;
    }
    prompt += `\n`;
  }

  prompt += `--- REQUIRED JSON RESPONSE STRUCTURE ---
Return a JSON object with this EXACT structure:
{
  "definition": "One-sentence formal definition in ${targetLanguage} with preserved terms",
  "quickAnswer": "Direct, crisp answer in 2-3 sentences in ${targetLanguage}",
  "explanation": "Comprehensive educational explanation in ${targetLanguage} formatted with paragraphs",
  "analogy": "A relatable real-world analogy in ${targetLanguage} explaining the core concept",
  "example": "A concrete technical example or code snippet with explanations in ${targetLanguage}",
  "stepByStep": [
    "Step 1: description in ${targetLanguage}",
    "Step 2: description in ${targetLanguage}",
    "Step 3: description in ${targetLanguage}"
  ],
  "keyPoints": [
    "Key takeaway 1 in ${targetLanguage}",
    "Key takeaway 2 in ${targetLanguage}",
    "Key takeaway 3 in ${targetLanguage}"
  ],
  "technicalTerms": [
    {
      "term": "Term in English",
      "translation": "Preferred term/transliteration in ${targetLanguage}",
      "explanation": "Why this term is used and how it functions in ${targetLanguage}"
    }
  ],
  "preservedTerms": ["Term 1", "Term 2", "Term 3"],
  "misconceptions": [
    "Common student mistake 1 in ${targetLanguage}",
    "Common student mistake 2 in ${targetLanguage}"
  ]
}

Ensure all explanations and sentences are in ${targetLanguage}, while preserved technical terms retain their standard engineering nomenclature.`;

  return prompt;
}
