import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userProfile, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from user profile
    let profileContext = "";
    if (userProfile) {
      const bmi = userProfile.weight_kg && userProfile.height_cm 
        ? (userProfile.weight_kg / Math.pow(userProfile.height_cm / 100, 2)).toFixed(1)
        : null;
      
      profileContext = `
User Profile:
- Name: ${userProfile.full_name || 'Not provided'}
- Height: ${userProfile.height_cm ? userProfile.height_cm + ' cm' : 'Not provided'}
- Weight: ${userProfile.weight_kg ? userProfile.weight_kg + ' kg' : 'Not provided'}
- Target Weight: ${userProfile.target_weight_kg ? userProfile.target_weight_kg + ' kg' : 'Not provided'}
- BMI: ${bmi || 'Cannot calculate'}
- Fitness Goal: ${userProfile.fitness_goal || 'general_health'}
- Activity Level: ${userProfile.activity_level || 'moderately_active'}
- Dietary Preference: ${userProfile.dietary_preference || 'none'}
- Allergies: ${userProfile.allergies?.join(', ') || 'None'}
- Medical Conditions: ${userProfile.medical_conditions?.join(', ') || 'None'}
`;
    }

    let systemPrompt = `You are an expert AI Dietician and Nutritionist. You provide personalized, evidence-based dietary advice, meal plans, and nutritional guidance.

${profileContext}

Guidelines:
1. Always consider the user's profile, goals, dietary preferences, and restrictions
2. Provide specific, actionable advice with portion sizes and nutritional values
3. Be encouraging and supportive while being scientifically accurate
4. When suggesting meals, include estimated calories and macros
5. If asked about medical conditions, recommend consulting a healthcare provider
6. Use a friendly, motivational tone

For meal plans, structure responses with clear sections:
- Breakfast, Lunch, Dinner, Snacks
- Include calories and macros for each meal
- Provide alternatives for variety`;

    // Handle specific actions
    if (action === 'generate_diet_plan') {
      systemPrompt += `\n\nThe user wants a personalized diet plan. Generate a comprehensive 7-day meal plan with:
1. Daily calorie targets based on their goals
2. Macro breakdown (protein, carbs, fats)
3. Specific meal suggestions for each day
4. Grocery list summary
Format the response in a clear, structured way.`;
    } else if (action === 'generate_grocery_list') {
      systemPrompt += `\n\nGenerate a comprehensive grocery list based on the diet plan discussed. Organize by category:
- Proteins
- Vegetables
- Fruits
- Grains
- Dairy/Alternatives
- Pantry Staples
Include estimated quantities for a week.`;
    } else if (action === 'log_meal') {
      systemPrompt += `\n\nHelp the user log their meal. Ask about:
- What they ate
- Portion sizes
Provide estimated nutritional values (calories, protein, carbs, fat, fiber).`;
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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("ai-dietician error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
