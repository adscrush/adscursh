export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 p-4 dark:from-neutral-950 dark:to-neutral-900">
      {children}
    </div>
  )
}
