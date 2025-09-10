type AuthState = {
  user: any;
  profile: { role: "admin" | "user" } | null;
};

export const checkAuthState = async (): Promise<AuthState> => {
  // For homepage Dashboard link, always redirect to login
  // This avoids any auth initialization that would cause console errors
  return { user: null, profile: null };
};

export const getDashboardRoute = (
  profile: { role: "admin" | "user" } | null
): string => {
  if (profile?.role === "admin") {
    return "/upload";
  } else if (profile?.role === "user") {
    return "/user-dashboard";
  }
  return "/login";
};
