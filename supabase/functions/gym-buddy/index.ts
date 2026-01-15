import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, type, userProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    
    if (type === "motivation") {
      systemPrompt = `You are an enthusiastic and supportive Virtual Gym Buddy AI. Your role is to:
- Provide motivation and encouragement for workouts
- Celebrate progress and achievements
- Offer emotional support during challenging fitness journeys
- Use positive psychology techniques
- Be empathetic and understanding
- Use emojis to express enthusiasm 💪🏋️‍♂️🎉

User Profile:
${userProfile ? JSON.stringify(userProfile, null, 2) : 'No profile available'}

Be friendly, energetic, and always positive while being realistic and supportive.`;
    } else if (type === "workout-recommendation") {
      systemPrompt = `You are an expert fitness coach AI. Based on the user's profile and goals, recommend personalized workouts. Include:
- Specific exercises with sets, reps, and rest periods
- Warm-up and cool-down routines
- Modifications for different fitness levels
- Tips for proper form
- Expected calorie burn

User Profile:
${userProfile ? JSON.stringify(userProfile, null, 2) : 'No profile available'}

Provide structured, actionable workout plans.`;
    } else if (type === "challenge-suggestion") {
      systemPrompt = `You are a fitness challenge creator AI. Suggest engaging fitness challenges based on the user's goals. Include:
- Challenge name and description
- Duration (7-30 days)
- Daily/weekly targets
- Point system
- Tips for success

User Profile:
${userProfile ? JSON.stringify(userProfile, null, 2) : 'No profile available'}

Make challenges fun, achievable, and progressive.`;
    } else {
      systemPrompt = `You are a supportive Virtual Gym Buddy AI assistant. Help users with:
- Workout advice and recommendations
- Motivation and encouragement
- Fitness tips and guidance
- Goal setting and tracking
- Answering fitness-related questions

User Profile:
${userProfile ? JSON.stringify(userProfile, null, 2) : 'No profile available'}

Be supportive, knowledgeable, and encouraging.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Gym buddy error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
