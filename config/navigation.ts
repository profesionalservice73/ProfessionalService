export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProfessionalMain: undefined;
  AdminDashboard: undefined;
  ProfessionalRegisterSteps: undefined;
  EditProfile: undefined;
  Settings: undefined;
  CustomerSupport: undefined;
  About: undefined;
  ClientSettings: undefined;
  ClientAbout: undefined;
  ClientCustomerSupport: undefined;
  CategoryDetail: { categoryId: string };
  ProfessionalDetail: { id: string };
  CreateRequest: undefined;
  EditRequest: { request: any };
  RequestDetail: { requestId: string; request: any };
  Reviews: { professionalId: string; professionalName: string; professionalImage?: string };
  AddReview: { professionalId: string; professionalName: string; onReviewAdded?: () => void };
  SearchResults: { searchQuery: string; categoryId?: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string; maskedContact: string };
};

export type MainTabParamList = {
  Home: undefined;
  Requests: undefined;
  Favorites: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  ProfessionalDetail: { id: string };
  ServiceRequest: undefined;
};

export type RequestsStackParamList = {
  RequestsScreen: undefined;
  RequestDetail: { id: string };
  CreateRequest: undefined;
};

export type FavoritesStackParamList = {
  FavoritesScreen: undefined;
  ProfessionalDetail: { id: string };
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfile: undefined;
  Settings: undefined;
};
