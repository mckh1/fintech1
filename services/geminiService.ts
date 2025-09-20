import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function fetchDefinition(term: string): Promise<string> {
  if (!term) {
    throw new Error("검색할 용어를 입력해주세요.");
  }

  try {
    // A prompt designed to get a well-structured and easy-to-understand answer.
    const prompt = `
      금융 용어: "${term}"
      
      위 금융 용어에 대해 아래 구조에 맞춰 한국어로 설명해주세요. 설명은 금융을 잘 모르는 사람도 쉽게 이해할 수 있도록 명확하고 친절한 어조로 작성해주세요. 전체 답변은 마크다운 형식을 사용하지 말고, 500자 내외로 요약해주세요.

      1. 📖 정의:
      [용어에 대한 핵심적인 정의를 1~2문장으로 간결하게 설명]

      2. 💡 핵심 개념:
      [용어를 이해하는 데 필요한 주요 개념이나 원리를 간략하게 설명]

      3. 📈 실제 사용 예시:
      [이 용어가 어떻게 사용되는지 간결한 예시 1개 제시]

      4. 🤔 쉬운 비유:
      [복잡한 개념을 일상적인 상황에 빗대어 한 문장으로 비유]
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;

  } catch (error) {
    console.error("Gemini API 호출 중 오류 발생:", error);
    throw new Error("AI 모델에서 정의를 가져오는 데 실패했습니다. 네트워크 연결을 확인하거나 나중에 다시 시도해주세요.");
  }
}