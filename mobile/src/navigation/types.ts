export type OnboardingStackParamList = {
  Welcome: undefined;
  Name: undefined;
  Interests: undefined;
  Personality: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  FTUE: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  GrandmaTab: { prefilledIntent?: string } | undefined;
  RecipesTab: undefined;
  TasksTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
};

export type RecipesStackParamList = {
  RecipesHome: undefined;
  RecipeDetail: { recipeId: string };
  RecipeCategory: { category: string };
  FamilyCookbook: undefined;
  FamilyCookbookDetail: { recipeId: string };
  FamilyCookbookAdd: undefined;
};

export type TasksStackParamList = {
  TasksHome: undefined;
  Planner: undefined;
  GroceryLists: undefined;
  GroceryListDetail: { listId: string };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  MemorySettings: undefined;
  NotificationSettings: undefined;
  SubscriptionSettings: undefined;
  PersonalitySettings: undefined;
};
