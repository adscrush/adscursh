export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="bg-background bg-gradient-to-br from-neutral-50 to-neutral-100 p-4 dark:from-neutral-950 dark:to-neutral-900">
      <div className="flex min-h-svh w-full items-center justify-center ">
        {children}
      </div>
    </main>
  )
}
