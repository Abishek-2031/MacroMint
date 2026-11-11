import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import knowledgeBase from '@/data/nutrition_knowledge.json';

const dishes = knowledgeBase.dishes;
const faqs = knowledgeBase.faqs;

function buildSystemContext(extraDishes: { name: string; data: string }[]): string {
  const dishList = [...dishes, ...extraDishes.map(d => JSON.parse(d.data))]
    .map(d => `- ${d.name}: ${d.calories}kcal, P:${d.protein}g C:${d.carbs}g F:${d.fat}g, ₹${d.price}`)
    .join('\n');
  
  const faqContext = faqs.map(f => `Q: ${f.q}\nA: ${f.a}`).join('\n\n');

  return `You are MacroMint's AI nutrition assistant, an expert in Indian diets and nutrition science.

AVAILABLE DISHES:
${dishList}

FAQ KNOWLEDGE:
${faqContext}

Guidelines:
- Always reference specific dishes by name and their exact macros
- Use Indian food terminology naturally
- Provide actionable, science-backed advice
- Keep responses concise and friendly
- When asked about calories/macros, do precise calculations
- Mention ₹ INR pricing when discussing meals
- If asked something outside nutrition/food, politely redirect`;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();

  try {
    const { message, history = [] } = await req.json();

    // Get extra knowledge from DB
    const extraDishes = await prisma.knowledgeBase.findMany({
      where: { category: 'dish' },
    });

    const systemContext = buildSystemContext(extraDishes);

    // Build conversation history for context
    const recentHistory = history.slice(-8);
    const conversationContext = recentHistory
      .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    // Rule-based AI with knowledge grounding
    const response = await generateResponse(message, systemContext, conversationContext, extraDishes);

    // Save message to DB if user is logged in
    if (user) {
      await prisma.chatMessage.createMany({
        data: [
          { userId: user.userId, role: 'user', content: message },
          { userId: user.userId, role: 'assistant', content: response },
        ],
      });
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}

async function generateResponse(
  message: string,
  systemContext: string,
  history: string,
  extraDishes: { name: string; data: string }[]
): Promise<string> {
  const lowerMsg = message.toLowerCase();

  // Dish recommendations
  if (lowerMsg.includes('recommend') || lowerMsg.includes('suggest') || lowerMsg.includes('what should i eat')) {
    const allDishes = [...dishes, ...extraDishes.map(d => JSON.parse(d.data))];
    const highProtein = allDishes.filter(d => d.protein >= 20).slice(0, 3);
    return `Here are my top high-protein recommendations for today:\n\n${highProtein.map(d => 
      `🍽️ **${d.name}** — ${d.calories} kcal | P: ${d.protein}g | ₹${d.price}\n   ${d.description}`
    ).join('\n\n')}\n\nAll can be delivered in under 20 minutes! Which sounds good?`;
  }

  if (lowerMsg.includes('bmr') || lowerMsg.includes('basal metabolic rate')) {
    return `Your **BMR (Basal Metabolic Rate)** is the number of calories your body burns at complete rest to keep you alive — breathing, pumping blood, and running your organs.\n\n📐 **Formula used**: Mifflin-St Jeor (most accurate for most people)\n- **Men**: (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5\n- **Women**: (10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161\n\nWant me to calculate yours? Head to the **Onboarding Wizard** for your personalized breakdown!`;
  }

  if (lowerMsg.includes('tdee') || lowerMsg.includes('total daily energy')) {
    return `**TDEE (Total Daily Energy Expenditure)** = your BMR × Activity Multiplier\n\n📊 **Activity Multipliers:**\n- Sedentary (desk job): ×1.2\n- Lightly Active (1-3 days/week): ×1.375\n- Moderately Active (3-5 days/week): ×1.55\n- Very Active (6-7 days/week): ×1.725\n- Extra Active (athlete): ×1.9\n\nYour TDEE is your **maintenance calories** — eat below it to lose fat, above to gain muscle!`;
  }

  if (lowerMsg.includes('protein')) {
    return `**Protein targets at MacroMint:**\n\n💪 **Fat Loss**: 2.2g per kg body weight\n🏋️ **Muscle Gain**: 2.0g per kg body weight\n🔄 **Recomposition**: 2.4g per kg body weight\n⚖️ **Maintenance**: 1.6g per kg body weight\n\n**High-protein Indian options:**\n${dishes.filter(d => d.protein >= 18).map(d => `• ${d.name}: ${d.protein}g protein (₹${d.price})`).join('\n')}\n\nProtein = 4 kcal/gram. It's your most important macro for body composition!`;
  }

  if (lowerMsg.includes('ragi') || lowerMsg.includes('millet') || lowerMsg.includes('ancient grain')) {
    return `**Millets & Ancient Grains at MacroMint** 🌾\n\nWe love millets! They're the backbone of South Indian nutrition:\n\n• **Ragi (Finger Millet)**: High calcium, iron, and fiber. 328 kcal/100g\n• **Foxtail Millet**: Low glycemic index, great for diabetics. 331 kcal/100g\n• **Bajra (Pearl Millet)**: Rich in magnesium and B vitamins. 361 kcal/100g\n\nOur **Ragi Dosa** (285 kcal, ₹95) and **Grilled Chicken Millet Bowl** (495 kcal, ₹220) are customer favorites!\n\nWant to add a millet dish to your plan?`;
  }

  if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('budget') || lowerMsg.includes('₹')) {
    const sortedByPrice = [...dishes].sort((a, b) => a.price - b.price);
    return `**MacroMint Pricing** 💰\n\nMeals range from **₹85 to ₹220** per serving:\n\n🏆 **Best Value:**\n${sortedByPrice.slice(0, 3).map(d => `• ${d.name}: ₹${d.price} (${d.calories} kcal)`).join('\n')}\n\n📦 **Premium Options:**\n${sortedByPrice.slice(-2).map(d => `• ${d.name}: ₹${d.price} (${d.calories} kcal)`).join('\n')}\n\nYou can also set a **daily budget (₹150–₹1,500)** in your profile and we'll auto-match meals within range!`;
  }

  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
    return `Namaste! 🙏 I'm **MacroMint AI**, your personal nutrition guide for authentic Indian healthy eating!\n\nI can help you with:\n• 🥗 Dish recommendations & macro breakdowns\n• 📊 BMR, TDEE & calorie calculations\n• 🧮 Protein/Carb/Fat targets for your goals\n• 💰 Budget-friendly meal suggestions\n• 🌾 Millet & traditional Indian grain benefits\n\nWhat would you like to know today?`;
  }

  if (lowerMsg.includes('fat loss') || lowerMsg.includes('weight loss') || lowerMsg.includes('lose weight')) {
    return `**Fat Loss Strategy with Indian Diet** 🔥\n\n**Calorie Deficit**: Aim for 300-500 kcal below your TDEE\n**Protein**: 2.2g per kg bodyweight to preserve muscle\n**Carbs**: Time around workouts; prefer complex carbs\n\n**Best MacroMint picks for fat loss:**\n${dishes.filter(d => d.calories < 400 && d.protein >= 15).map(d => 
      `• **${d.name}**: ${d.calories} kcal | ${d.protein}g protein | ₹${d.price}`
    ).join('\n')}\n\n💡 **Tip**: Dal + vegetable dishes are fat loss gold — high fiber, filling, and budget-friendly!`;
  }

  // Default response
  const relevantDish = dishes[Math.floor(Math.random() * dishes.length)];
  return `Great question! Here's something to consider 🤔\n\n${systemContext.includes(message.substring(0, 20)) 
    ? 'Based on our nutrition database, '
    : 'From a nutrition science perspective, '
  }I'd recommend exploring how your meals align with your macro targets.\n\nFor example, our **${relevantDish.name}** provides ${relevantDish.calories} kcal with ${relevantDish.protein}g protein — perfect for most fitness goals!\n\nCould you be more specific? I can help with:\n• Specific dish recommendations\n• Macro calculations\n• BMR/TDEE questions\n• Indian diet tips`;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ messages: [] });

  const messages = await prisma.chatMessage.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: 'asc' },
    take: 50,
  });

  return NextResponse.json({ messages });
}

