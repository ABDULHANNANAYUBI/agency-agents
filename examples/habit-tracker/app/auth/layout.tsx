// Standalone segment layout for /auth — no Navbar, no extra providers.
// The root layout already supplies ThemeProvider and AuthGuard.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
