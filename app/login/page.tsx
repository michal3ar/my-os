import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-background to-secondary/30">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="text-5xl mb-4">✨</div>
          <h1 className="text-3xl font-bold tracking-tight">MyOS</h1>
          <p className="text-muted-foreground text-base">המערכת האישית שלי</p>
        </div>
        <LoginForm />
        <p className="text-center text-xs text-muted-foreground">
          מנהלת אישית חכמה — בהירות יומית, פחות עומס מנטלי
        </p>
      </div>
    </div>
  );
}
