import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  pixelBasedPreset,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
  url?: string;
  token?: string;
}

const logoUrl = `https://adscrush.com/wp-content/uploads/2023/08/favicon.png`;

export const PasswordResetEmail = ({ url, token }: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Tailwind
      config={{
        presets: [pixelBasedPreset],
        theme: {
          fontFamily: {
            linear: ["Linear", "sans-serif"],
          },
        },
      }}
    >
      <Body className="bg-white font-linear">
        <Preview>Reset your AdsCrush password</Preview>
        <Container className="mx-auto my-0 max-w-[560px] px-0 pt-5 pb-12">
          <Img
            src={logoUrl}
            width="42"
            height="42"
            alt="AdsCrush"
            className="rounded-md w-[42px] h-[42px]"
          />
          <Heading className="text-[24px] tracking-[-0.5px] leading-[1.3] font-normal text-[#484848] pt-[17px] px-0 pb-0">
            Reset your AdsCrush password
          </Heading>
          <Text className="mb-[15px] mx-0 mt-[20px] leading-[1.4] text-[15px] text-[#3c4149]">
            We received a request to reset your password. Click the button below to create a new password:
          </Text>
          <Section className="py-[27px] px-0">
            <Button
              className="bg-[#5e6ad2] rounded-md font-semibold text-white text-[15px] no-underline text-center block py-[11px] px-[23px]"
              href={url}
            >
              Reset Password
            </Button>
          </Section>
          <Text className="mb-[15px] mx-0 mt-0 leading-[1.4] text-[15px] text-[#3c4149]">
            This link will expire in 15 minutes. If you didn&apos;t request a password reset, you can safely ignore this email.
          </Text>
          <Text className="mb-[15px] mx-0 mt-0 leading-[1.4] text-[15px] text-[#3c4149]">
            If the button above doesn&apos;t work, copy and paste this link into your browser:
          </Text>
          <code className="font-mono text-[12px] px-1 py-px bg-[#dfe1e4] text-[#3c4149] tracking-[-0.3px] rounded break-all">
            {url}
          </code>
          <Hr className="border-[#dfe1e4] mt-[42px] mb-[26px]" />
         
          <Section className="pt-[45px]">
              <Img
                className="max-w-full"
                width={620}
                src={`https://app.adscrush.local/emails/footer.png`}
                alt="Adscrush footer decoration"
              />
            </Section>

          <Text className="text-center text-xs leading-[24px] text-black/70">
              © 2026 | Adscrush Pvt. Ltd. | 83, Pocket D, Okhla Phase II, Delhi 110020. | adscrush.com
            </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

PasswordResetEmail.PreviewProps = {
  url: "https://localhost:3000/auth/reset-password?token=abc123",
  token: "abc123",
} as PasswordResetEmailProps;

export default PasswordResetEmail;
