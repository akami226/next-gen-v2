// Environment variable validation utility
export function validateEnvironment() {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];

  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}. Please check your .env file.`;
    console.error(errorMessage);

    // In development, show an alert; in production, this would be logged
    if (import.meta.env.DEV) {
      alert(errorMessage);
    }

    throw new Error(errorMessage);
  }

  // Validate Supabase URL format
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    const errorMessage = 'VITE_SUPABASE_URL appears to be invalid. Expected format: https://xxxxx.supabase.co';
    console.error(errorMessage);
    if (import.meta.env.DEV) {
      alert(errorMessage);
    }
    throw new Error(errorMessage);
  }

  console.log('✅ Environment variables validated successfully');
}