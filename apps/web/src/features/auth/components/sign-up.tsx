"use client"

import { signUp } from "@/lib/auth/client"
import {
  signUpBaseSchema,
  type SignUpForm,
} from "@adscrush/shared/validators/auth.schema"
import { Button } from "@adscrush/ui/components/button"
import { FieldError } from "@adscrush/ui/components/field"
import { Input } from "@adscrush/ui/components/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconBrandApple, IconBrandGoogle } from "@tabler/icons-react"
import { Eye, EyeOff, Mail, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import AuthSplitLayout from "./auth-layout"

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Pick<SignUpForm, "name" | "email" | "password">>({
    resolver: zodResolver(
      signUpBaseSchema.pick({ name: true, email: true, password: true })
    ),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const onSubmit = handleSubmit((values) => {
    setFormError("")

    startTransition(async () => {
      try {
        const result = await signUp.email({
          name: values.name,
          email: values.email,
          password: values.password,
        })

        if (result.error) {
          setFormError(result.error.message ?? "Unable to create account.")
          return
        }

        router.push("/")
      } catch {
        setFormError(
          "Unable to create your account right now. Please try again."
        )
      }
    })
  })

  const isLoading = isPending

  return (
    <AuthSplitLayout
      switchText="Already have account?"
      switchLabel="Sign in"
      switchTo="/sign-in"
    >
      <div className="flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/20 bg-foreground/10">
          <Mail className="h-5 w-5" />
        </div>
      </div>

      <h1 className="mt-5 text-center text-4xl font-medium tracking-tight">
        Create Your Account
      </h1>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        Join Adscrush and start tracking clicks, conversions, and performance
        with one clean operator workflow.
      </p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit} noValidate>
        <label className="block space-y-2 text-sm">
          <span className="text-foreground/75">Full name</span>
          <div className="relative">
            <User className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="John Doe"
              aria-invalid={!!errors.name}
              className="h-12 border-border/20 bg-background/60 pl-10"
              {...register("name")}
            />
          </div>
          <FieldError errors={[errors.name]} />
        </label>

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
              placeholder="Create a strong password"
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
          {isLoading ? "Creating account..." : "Create account"}
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
        By creating an account, you agree to our{" "}
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

export default SignUp
