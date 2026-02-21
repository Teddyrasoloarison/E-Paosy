export interface GoogleProfile {
  sub: string;
  name?: string;
  email?: string;
}

export interface GoogleCredentials {
  username: string;
  password: string;
}

const toSafeUsername = (profile: GoogleProfile) => {
  const baseName = (profile.name || profile.email?.split('@')[0] || 'google_user')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '_')
    .replace(/_+/g, '_');

  const fallback = baseName.length >= 3 ? baseName : `google_${profile.sub.slice(0, 6)}`;
  return fallback;
};

export const googleAuthService = {
  getProfile: async (accessToken: string): Promise<GoogleProfile> => {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Impossible de recuperer les informations Google.");
    }

    const data = await response.json();
    return {
      sub: data.sub,
      name: data.name,
      email: data.email,
    };
  },

  toCredentials: (profile: GoogleProfile): GoogleCredentials => {
    const username = toSafeUsername(profile);

    // On construit un mot de passe deterministe base sur l'ID Google.
    const password = `google_${profile.sub}`;

    return { username, password };
  },
};
