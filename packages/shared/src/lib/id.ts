import { customAlphabet } from "nanoid"

const prefixes = {
  log: "log",
  advertiser: "adv",
  affiliate: "aff",
  employee: "emp",
  offer: "ofr",
  conversion: "cnv",
  landing_page: "lp",

  // auth ids
  user: "usr",
  session: "ses",
  account: "act",
  verification: "vrf",

  member: "mem",
  invitation: "inv",
  two_factor: "tfa",
} as const

interface GenerateIdOptions {
  length?: number
  separator?: string
}

export function generateId(
  prefixOrOptions?: keyof typeof prefixes | GenerateIdOptions,
  inputOptions: GenerateIdOptions = {}
) {
  const finalOptions =
    typeof prefixOrOptions === "object" ? prefixOrOptions : inputOptions

  const prefix =
    typeof prefixOrOptions === "object" ? undefined : prefixOrOptions

  const { length = 12, separator = "_" } = finalOptions
  const id = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    length
  )()

  return prefix && prefix in prefixes
    ? `${prefixes[prefix]}${separator}${id}`
    : id
}
