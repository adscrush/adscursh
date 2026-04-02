"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, LockKeyhole } from "lucide-react"
import { IconBrandApple, IconBrandGoogle } from "@tabler/icons-react"
import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import AuthSplitLayout from "./auth-layout"
import { Button } from "@adscrush/ui/components/button"
import { FieldError } from "@adscrush/ui/components/field"
import { Input } from "@adscrush/ui/components/input"
import {
  signInSchema,
  type SignInForm,
} from "@adscrush/shared/validators/auth.schema"
import { signIn } from "@/lib/auth/client"

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = handleSubmit((values) => {
    setFormError("")

    startTransition(async () => {
      try {
        const result = await signIn.email({
          email: values.email,
          password: values.password,
        })

        if (result.error) {
          setFormError(result.error.message ?? "Invalid credentials.")
          return
        }

        router.push("/")
      } catch {
        setFormError("Unable to sign in right now. Please try again.")
      }
    })
  })

  const isLoading = isPending

  return (
    <AuthSplitLayout
      switchText="Don’t have account?"
      switchLabel="Sign up"
      switchTo="/sign-up"
    >
      <div className="flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/20 bg-foreground/10">
          <LockKeyhole className="h-5 w-5" />
        </div>
      </div>

      <h1 className="mt-5 text-center text-3xl font-medium">
        Authenticate to Continue
      </h1>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        Secure access to attribution reporting, monitoring, and operator
        workflows.
      </p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit} noValidate>
        <label className="block space-y-2 text-sm">
          <span className="text-foreground/75">Work email</span>
          <Input
            type="email"
            placeholder="hello@adscrush.com"
            aria-invalid={!!errors.email}
            className="h-12 border-border/20 bg-background/60"
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </label>

        <label className="block space-y-2 text-sm">
          <span className="text-foreground/75">Password</span>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              className="h-12 border-border/20 bg-background/60 pr-11"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <FieldError errors={[errors.password]} />
        </label>

        {formError ? <FieldError>{formError}</FieldError> : null}

        <Button
          type="submit"
          className="h-12 w-full rounded-md bg-foreground text-background hover:bg-foreground/90"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-border/20" />
        <span className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
          or
        </span>
        <span className="h-px flex-1 bg-border/20" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-12 w-full border-border/20 bg-background/60"
        >
          <IconBrandGoogle className="h-4 w-4" />
          Google
        </Button>
        <Button
          variant="outline"
          className="h-12 w-full border-border/20 bg-background/60"
        >
          <IconBrandApple className="h-4 w-4" />
          Apple
        </Button>
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
        By continuing, you agree to our{" "}
        <Link href="#" className="underline underline-offset-4">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="#" className="underline underline-offset-4">
          Privacy Policy
        </Link>
        .
      </p>
    </AuthSplitLayout>
  )
}

export default SignIn
