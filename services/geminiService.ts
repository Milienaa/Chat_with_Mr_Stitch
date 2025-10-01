import { GoogleGenAI, Type } from "@google/genai";
import type { Message, ExtractedAP, SentimentAnalysis, StanceType, FollowupResult, GeneratedDocument, SimulationMessage, TokenUsage } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const updateProjectDocumentTool = {
  functionDeclarations: [{
    name: "updateProjectDocument",
    description: "Updates the project document with a full, state-managed list of action points AND an analysis of the dialogue's current tone. This tool must be called on every analysis.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        extractAP: {
          type: Type.OBJECT,
          description: "The complete, updated, and de-duplicated list of all action points for the entire project. This is not a diff, but the full state.",
          properties: {
            tasks: {
              type: Type.ARRAY,
              description: "The complete list of all identified tasks.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "A stable, unique identifier for the task. Preserve existing IDs if the task is unchanged or updated." },
                  title: { type: Type.STRING, description: "A short, clear title for the task." },
                  responsible: { type: Type.STRING, description: "The name of the person responsible for the task." },
                  dueDate: { type: Type.STRING, description: "The due date for the task in DD.MM.YYYY format." }
                },
                required: ["id", "title", "responsible", "dueDate"]
              }
            },
            insights: {
              type: Type.ARRAY,
              description: "The complete list of all identified insights or key observations.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "A stable, unique identifier for the insight." },
                  observation: { type: Type.STRING, description: "The observation or insight." },
                  author: { type: Type.STRING, description: "The name of the person who made the observation." }
                },
                required: ["id", "observation", "author"]
              }
            },
            problems: {
              type: Type.ARRAY,
              description: "The complete list of all identified problems or risks.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "A stable, unique identifier for the problem." },
                  problem: { type: Type.STRING, description: "A description of the problem." },
                  responsible: { type: Type.STRING, description: "The name of the person responsible for addressing the problem." },
                  dueDate: { type: Type.STRING, description: "The date by which the problem should be addressed in DD.MM.YYYY format." }
                },
                required: ["id", "problem", "responsible", "dueDate"]
              }
            },
            openQuestions: {
              type: Type.ARRAY,
              description: "The complete list of all open questions that need answers.",
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "The specific question." },
                  author: { type: Type.STRING, description: "The name of the person who asked the question." },
                  id: { type: Type.STRING, description: "A stable, unique identifier for the question." }
                },
                required: ["id", "question", "author"]
              }
            }
          },
        },
        sentimentAnalysis: {
            type: Type.OBJECT,
            description: "An analysis of the overall tone and sentiment of the recent conversation, including the stance of each participant.",
            properties: {
              tone: {
                type: Type.STRING,
                description: "The overall sentiment. Can be one of: POSITIVE, NEUTRAL, NEGATIVE, MIXED."
              },
              summary: {
                type: Type.STRING,
                description: "A brief, one-sentence summary of the dialogue's mood."
              },
              participantStances: {
                type: Type.ARRAY,
                description: "A breakdown of each participant's stance in the current discussion.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stance: {
                      type: Type.STRING,
                      description: "The category of the stance. Use one of: INITIATORS, ENTHUSIASTS, CRITICS, NEUTRALS."
                    },
                    participants: {
                      type: Type.ARRAY,
                      description: "List of participant names who share this stance.",
                      items: { type: Type.STRING }
                    },
                    summary: {
                      type: Type.STRING,
                      description: "Дуже стислий підсумок (в ідеалі 3-5 слів), що відображає основну причину їхньої позиції. Приклад: 'Пропонує новий дизайн', 'Підтримує ідею', 'Сумнівається в термінах'."
                    }
                  },
                  required: ["stance", "participants", "summary"]
                }
              }
            },
            required: ["tone", "summary"]
        }
      }
    }
  }]
};

const systemInstruction = `You are an AI project assistant, Mr Stitch, integrated into a team chat.
Your primary role is to act as a STATE MANAGER for a live project document by analyzing the entire conversation and the document's current state.
You will be given the 'current_document_state' and the full 'chat_history'.
Your task is to return a NEW, COMPLETE, and UPDATED version of the project document using the 'updateProjectDocument' tool.

The tool has two parts: 'sentimentAnalysis' (always required) and 'extractAP' (the state-managed action points).

**CRITICAL RULES FOR 'extractAP' (ACTION POINT STATE MANAGEMENT):**

1.  **YOUR GOAL: MAINTAIN A CLEAN, CURRENT & CONCISE DOCUMENT.** You are not just adding new items. You are the single source of truth. Your output from 'extractAP' will completely REPLACE the previous document state.
2.  **MERGE & DE-DUPLICATE:** If multiple messages discuss the same core problem, task, or insight (e.g., three separate messages about LTV risks), you MUST synthesize them into a SINGLE, well-formulated Action Point. Do not create multiple entries for the same underlying issue.
3.  **UPDATE & REFINE:** If a new message adds detail to an existing Action Point, you must UPDATE that item in the list. Do not create a new one. Preserve its original 'id'.
4.  **DELETE RESOLVED ITEMS:** If the conversation shows that a previously recorded 'problem' has been solved, a 'question' has been answered, or a 'task' is no longer relevant, you MUST REMOVE it from the lists you return. The document should only reflect what is currently active and important.
5.  **BE AN ELITE PM:** Be extremely selective. Your value is distilling a long discussion into a few critical Action Points. Focus ONLY on high-level, strategic outcomes. It is better to return an empty list than a list full of low-value noise.
6.  **ID MANAGEMENT:**
    -   When returning an existing item (even if updated), you MUST use its existing 'id' from the 'current_document_state'.
    -   When creating a new item, generate a short, descriptive, and unique ID string for it (e.g., 'task-appsumo-prep', 'problem-ltv-risk').

**CRITICAL RULES FOR 'sentimentAnalysis':**

1.  **ALWAYS PROVIDE IT:** You must provide a 'sentimentAnalysis' with every tool call.
2.  **ONE STANCE PER PARTICIPANT:** Assign each person to only ONE stance category. Do not list the same person under multiple stances.
3.  **GROUP PARTICIPANTS:** Group all participants with the same stance into a single entry.

Your only output is through the 'updateProjectDocument' tool. Do not engage in conversation. The entire response must be in Ukrainian.`;


interface AnalysisResult {
  extractAP: ExtractedAP | null;
  sentimentAnalysis: SentimentAnalysis | null;
}

export const analyzeDialogue = async (messages: Message[], currentDocument: GeneratedDocument): Promise<{ result: AnalysisResult | null; usage: TokenUsage }> => {
  const chatHistory = messages
    .map(msg => `${msg.user.name}: ${msg.text}`)
    .join('\n');

  if (messages.length < 1) {
    return { result: null, usage: { input: 0, output: 0, cached: 0, total: 0 } };
  }
  
  const prompt = `Here is the current state of the project document:\n${JSON.stringify(currentDocument, null, 2)}\n\n---\n\nHere is the full chat history:\n${chatHistory}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [updateProjectDocumentTool],
        systemInstruction: systemInstruction,
      },
    });

    const usage: TokenUsage = {
        input: response.usageMetadata?.promptTokenCount || 0,
        output: response.usageMetadata?.candidatesTokenCount || 0,
        cached: response.usageMetadata?.cachedContentTokenCount || 0,
        total: response.usageMetadata?.totalTokenCount || 0,
    };

    const call = response.functionCalls?.[0];

    if (call?.name === 'updateProjectDocument' && call.args) {
      const args = call.args as any;
      
      const extractAP: ExtractedAP | null = args.extractAP || null;
      const sentimentAnalysisRaw = args.sentimentAnalysis;
      
      const sentimentAnalysis: SentimentAnalysis | null =
        (sentimentAnalysisRaw && sentimentAnalysisRaw.tone && sentimentAnalysisRaw.summary)
          ? {
              ...sentimentAnalysisRaw,
              participantStances: sentimentAnalysisRaw.participantStances?.map((p: any) => ({
                ...p,
                stance: p.stance as StanceType,
              }))
            }
          : null;

      return {
        result: {
          extractAP,
          sentimentAnalysis,
        },
        usage,
      };
    }

    console.error("Gemini did not return the expected 'updateProjectDocument' function call.", response);
    return { result: null, usage };

  } catch (error) {
    console.error("Error analyzing chat with Gemini:", error);
    throw new Error("Failed to communicate with the AI service.");
  }
};

const discussionFollowupTool = {
  functionDeclarations: [{
    name: "createDiscussionFollowup",
    description: "Creates a detailed follow-up summary of a discussion segment. This includes accepted/rejected points, disputes, insights, open questions, and next steps.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: "A brief, concise summary of the discussion period." },
        accepted: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of points, ideas, or decisions that were clearly accepted by the group." },
        rejected: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of points, ideas, or decisions that were clearly rejected." },
        disputedPoints: { type: Type.STRING, description: "A detailed description of points that remain contentious or unresolved, highlighting different viewpoints." },
        keyInsights: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of the most important ideas or insights that emerged." },
        openQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of specific questions that still need to be answered." },
        diffFromPrevious: { type: Type.STRING, description: "Optional. If a previous follow-up was provided, describe any significant changes or reversals from it (e.g., a previously accepted task is now rejected)." },
        nextSteps: { type: Type.STRING, description: "A proposed action plan to move the discussion forward and resolve open issues." }
      },
      required: ["summary", "accepted", "rejected", "disputedPoints", "keyInsights", "openQuestions", "nextSteps"]
    }
  }]
};

const systemInstructionFollowup = `You are Mr Stitch, an AI project assistant. A user has asked you for a follow-up on the recent conversation.
Analyze the provided conversation segment. If a previous follow-up exists, take it into account to identify changes.
Your task is to generate a structured summary using the 'createDiscussionFollowup' tool.
- Summarize the key topics discussed.
- Clearly list what was agreed upon ('accepted') and what was dismissed ('rejected').
- Detail any 'disputedPoints' where consensus was not reached.
- List the main 'keyInsights'.
- List any 'openQuestions'.
- If applicable, highlight major differences from the previous state in 'diffFromPrevious'.
- Propose clear 'nextSteps' to guide the team.
Your entire output must be through the 'createDiscussionFollowup' tool. The response must be in Ukrainian.`;

export const generateFollowup = async (newMessages: Message[], previousFollowup: FollowupResult | null): Promise<{ result: FollowupResult | null; usage: TokenUsage }> => {
  const newChatHistory = newMessages.map(msg => `${msg.user.name}: ${msg.text}`).join('\n');
  if (newMessages.length === 0) return { result: null, usage: { input: 0, output: 0, cached: 0, total: 0 } };

  let prompt = `Here is the new conversation to analyze:\n\n${newChatHistory}`;
  if (previousFollowup) {
    prompt = `A previous follow-up summary exists. Here it is for context:\n\n${JSON.stringify(previousFollowup)}\n\n---\n\nBased on that context, here is the new conversation to analyze:\n\n${newChatHistory}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [discussionFollowupTool],
        systemInstruction: systemInstructionFollowup,
      },
    });

    const usage: TokenUsage = {
        input: response.usageMetadata?.promptTokenCount || 0,
        output: response.usageMetadata?.candidatesTokenCount || 0,
        cached: response.usageMetadata?.cachedContentTokenCount || 0,
        total: response.usageMetadata?.totalTokenCount || 0,
    };

    const call = response.functionCalls?.[0];
    if (call?.name === 'createDiscussionFollowup' && call.args) {
      if (typeof (call.args as any).summary === 'string') {
        return { result: call.args as unknown as FollowupResult, usage };
      }
    }
    
    console.error("Gemini did not return the expected 'createDiscussionFollowup' function call.", response);
    return { result: null, usage };
  } catch (error) {
    console.error("Error generating followup with Gemini:", error);
    throw new Error("Failed to generate follow-up from the AI service.");
  }
};


const systemInstructionDiscussionGeneration = `You are a scriptwriter AI. Your task is to generate a realistic, multi-person chat discussion based on a user's prompt.
The prompt will specify the topic, participants, their roles (e.g., initiator, critic), the desired tone, length, and conclusion.
You must adhere to the specified participant names.
Your output must be a JSON array of message objects, where each object has a 'userName' and a 'text' property, conforming to the provided schema. Do not write any conversational text.
The generated conversation must be in Ukrainian.`;


export const generateDiscussion = async (prompt: string): Promise<SimulationMessage[] | null> => {
  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        userName: { type: Type.STRING, description: "The name of the user sending the message. Must be one of the provided participant names." },
        text: { type: Type.STRING, description: "The content of the message." }
      },
      required: ["userName", "text"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: systemInstructionDiscussionGeneration,
      },
    });

    if (response.text) {
      try {
        const parsedData = JSON.parse(response.text);

        // Basic validation to ensure we got an array of the correct objects
        if (
          Array.isArray(parsedData) &&
          (parsedData.length === 0 || 
            (typeof parsedData[0] === 'object' && parsedData[0] !== null && 'userName' in parsedData[0] && 'text' in parsedData[0]))
        ) {
          return parsedData as SimulationMessage[];
        } else {
           console.error("Parsed JSON for discussion generation does not match expected schema.", { parsedData });
           return null;
        }
      } catch (e) {
        console.error("Could not parse JSON from Gemini response for discussion generation.", { error: e, text: response.text });
        return null;
      }
    }

    console.error("Gemini did not return a valid text response for discussion generation.", { response });
    return null;

  } catch (error) {
    console.error("Error generating discussion with Gemini:", error);
    throw new Error("Failed to generate discussion from the AI service.");
  }
};