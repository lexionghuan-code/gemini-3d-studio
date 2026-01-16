
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CameraParams } from "../types";

export const generateImagePerspectives = async (
  base64Image: string,
  params: CameraParams,
  originalPrompt: string = "",
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1"
): Promise<string> => {
  // Initialize GoogleGenAI with the API key from process.env.API_KEY directly as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const getAzimuthText = (az: number) => {
    if (az >= 337.5 || az < 22.5) return "FRONT VIEW, looking directly at the face";
    if (az >= 22.5 && az < 67.5) return "FRONT-RIGHT side view";
    if (az >= 67.5 && az < 112.5) return "RIGHT PROFILE view";
    if (az >= 112.5 && az < 157.5) return "BACK-RIGHT side view";
    if (az >= 157.5 && az < 202.5) return "REAR VIEW (Directly from BEHIND). Show the back of the head, back of the body, and back of the clothes";
    if (az >= 202.5 && az < 247.5) return "BACK-LEFT side view";
    if (az >= 247.5 && az < 292.5) return "LEFT PROFILE view";
    return "FRONT-LEFT side view";
  };

  const getElevationText = (el: number) => {
    if (el < -15) return "LOW ANGLE looking UP";
    if (el >= -15 && el < 15) return "Standard EYE-LEVEL shot";
    return "HIGH ANGLE looking DOWN";
  };

  const cameraDescription = `${getAzimuthText(params.azimuth)}, ${getElevationText(params.elevation)}, Zoom scale ${params.distance.toFixed(2)}x`;
  
  const prompt = `[3D VIEWPORT RENDER MODE]
INPUT: A photograph of a person in a fixed pose.
TASK: Re-render this EXACT person and scene from a NEW CAMERA ANGLE.

NEW CAMERA: ${cameraDescription}.

CRITICAL CONSTRAINTS:
1. POSE LOCK: The subject is a FROZEN STATUE. Do not change their arms, legs, or head orientation relative to their body.
2. NO TURNING: If the camera is at the REAR, you MUST show the BACK of the person. Do not make them turn around to face the camera.
3. IDENTITY: Maintain the same facial features, hair, and clothing texture.
4. CONSISTENCY: The background lighting and environment must rotate logically with the camera.
5. Quality: Hyper-realistic 8k photo.

Context: ${originalPrompt}`;

  try {
    // Call generateContent with both the model name and prompt as per guidelines.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Image.split(',')[1] || base64Image,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        }
      }
    });

    let imageUrl = "";
    // Access parts to find the generated image (inlineData).
    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) throw new Error("API failed to return image data");
    return imageUrl;
  } catch (error) {
    console.error("Perspective Generation Error:", error);
    throw error;
  }
};
