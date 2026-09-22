import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SAMPLE_RECIPES = [
  {
    name: "Classic Chicken Parmesan",
    category: "Italian",
    servings: 4,
    prepMinutes: 20,
    cookMinutes: 30,
    difficulty: "medium",
    ingredients: [
      { name: "Chicken breast", quantity: "4", unit: "pieces" },
      { name: "Parmesan cheese", quantity: "1", unit: "cup" },
      { name: "Mozzarella cheese", quantity: "2", unit: "cups" },
      { name: "Marinara sauce", quantity: "2", unit: "cups" },
      { name: "Breadcrumbs", quantity: "1", unit: "cup" },
      { name: "Pasta", quantity: "1", unit: "lb" },
      { name: "Basil", quantity: "1/4", unit: "cup" },
    ],
    steps: [
      { text: "Pound chicken breasts to even thickness and season with salt and pepper." },
      { text: "Dredge chicken in breadcrumbs until fully coated." },
      { text: "Pan-fry until golden on both sides, about 4 minutes per side.", tip: "Don't crowd the pan - fry in batches so the crust stays crisp." },
      { text: "Top with marinara and cheese, then bake at 400°F for 15 minutes until bubbly." },
      { text: "Serve over pasta with fresh basil." },
    ],
    substitutions: ["Swap chicken for eggplant to make it vegetarian", "Gluten-free breadcrumbs work fine"],
    dietaryTags: [],
  },
  {
    name: "Southern Buttermilk Biscuits",
    category: "Southern",
    servings: 8,
    prepMinutes: 15,
    cookMinutes: 15,
    difficulty: "easy",
    ingredients: [
      { name: "All-purpose flour", quantity: "2", unit: "cups" },
      { name: "Buttermilk", quantity: "3/4", unit: "cup" },
      { name: "Butter", quantity: "1/2", unit: "cup" },
      { name: "Baking powder", quantity: "1", unit: "tbsp" },
      { name: "Salt", quantity: "1", unit: "tsp" },
    ],
    steps: [
      { text: "Cut cold butter into flour until pea-sized crumbs form.", tip: "Keep everything cold - cold butter is the secret to flaky layers." },
      { text: "Stir in buttermilk just until combined - don't overmix." },
      { text: "Pat dough out and fold over itself 3-4 times to create layers." },
      { text: "Cut into rounds and bake at 450°F for 12-15 minutes until golden." },
    ],
    substitutions: ["No buttermilk? Add 1 tbsp lemon juice to regular milk"],
    dietaryTags: ["vegetarian"],
  },
  {
    name: "Weeknight Beef Tacos",
    category: "Mexican",
    servings: 4,
    prepMinutes: 10,
    cookMinutes: 15,
    difficulty: "easy",
    ingredients: [
      { name: "Ground beef", quantity: "1", unit: "lb" },
      { name: "Taco seasoning", quantity: "2", unit: "tbsp" },
      { name: "Corn tortillas", quantity: "8", unit: "" },
      { name: "Cheddar cheese", quantity: "1", unit: "cup" },
      { name: "Lettuce", quantity: "1", unit: "cup" },
      { name: "Tomato", quantity: "1", unit: "" },
    ],
    steps: [
      { text: "Brown the beef over medium-high heat, breaking it up as it cooks." },
      { text: "Drain excess fat and stir in taco seasoning with a splash of water." },
      { text: "Warm tortillas in a dry skillet.", tip: "A few seconds a side over open flame gives a nice char if you've got a gas stove." },
      { text: "Assemble tacos with beef, cheese, lettuce, and tomato." },
    ],
    substitutions: ["Ground turkey works great in place of beef"],
    dietaryTags: [],
  },
  {
    name: "Classic Apple Pie",
    category: "Baking",
    servings: 8,
    prepMinutes: 30,
    cookMinutes: 50,
    difficulty: "medium",
    ingredients: [
      { name: "Apples", quantity: "6", unit: "" },
      { name: "Pie crust", quantity: "2", unit: "" },
      { name: "Sugar", quantity: "3/4", unit: "cup" },
      { name: "Cinnamon", quantity: "1", unit: "tsp" },
      { name: "Butter", quantity: "2", unit: "tbsp" },
    ],
    steps: [
      { text: "Peel and slice apples, toss with sugar and cinnamon." },
      { text: "Line a pie dish with crust and add the apple filling." },
      { text: "Dot with butter and cover with the top crust, sealing the edges." },
      { text: "Bake at 375°F for 50 minutes until golden.", tip: "Don't rush the cooling - let it rest at least an hour so the filling sets." },
    ],
    substitutions: ["Mix in a handful of cranberries for a tart twist"],
    dietaryTags: ["vegetarian"],
  },
];

async function main() {
  for (const recipe of SAMPLE_RECIPES) {
    const exists = await prisma.recipe.findFirst({ where: { name: recipe.name } });
    if (exists) continue;
    await prisma.recipe.create({
      data: {
        name: recipe.name,
        category: recipe.category,
        servings: recipe.servings,
        prepMinutes: recipe.prepMinutes,
        cookMinutes: recipe.cookMinutes,
        difficulty: recipe.difficulty,
        ingredients: JSON.stringify(recipe.ingredients),
        steps: JSON.stringify(recipe.steps),
        substitutions: JSON.stringify(recipe.substitutions),
        dietaryTags: JSON.stringify(recipe.dietaryTags),
        isGenerated: false,
      },
    });
  }
  console.log(`Seeded ${SAMPLE_RECIPES.length} recipes.`);
}

main().finally(() => prisma.$disconnect());
