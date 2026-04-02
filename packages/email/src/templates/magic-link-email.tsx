import { Body, Button, Container, Head, Heading, Hr, Html, Img, Link, pixelBasedPreset, Preview, Section, Tailwind, Text } from "@react-email/components";

interface MagicLinkEmailProps {
  url?: string;
  token?: string;
}

const logoUrl = `https://adscrush.com/wp-content/uploads/2023/08/favicon.png`; // Fallback to a production URL if available, otherwise we use public path
export const MagicLinkEmail = ({ url, token }: MagicLinkEmailProps) => (
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
        <Preview>Your login code for AdsCrush</Preview>
        <Container className="mx-auto my-0 max-w-[560px] px-0 pt-5 pb-12">
          <Img src={logoUrl} width="42" height="42" alt="AdsCrush" className="rounded-md w-[42px] h-[42px]" />
          <Heading className="text-[24px] tracking-[-0.5px] leading-[1.3] font-normal text-[#484848] pt-[17px] px-0 pb-0">Your login code for AdsCrush</Heading>
          <Section className="py-[27px] px-0">
            <Button className="bg-[#5e6ad2] rounded-md font-semibold text-white text-[15px] no-underline text-center block py-[11px] px-[23px]" href={url}>
              Login to Adscrush
            </Button>
          </Section>
          <Text className="mb-[15px] mx-0 mt-0 leading-[1.4] text-[15px] text-[#3c4149]">
            This link and code will only be valid for the next 5 minutes. If the link does not work, you can use the login verification code directly:
          </Text>
          <code className="font-mono font-bold px-1 py-px bg-[#dfe1e4] text-[#3c4149] text-[21px] tracking-[-0.3px] rounded">{token}</code>
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

MagicLinkEmail.PreviewProps = {
  url: "https://localhost:3000",
  token: "tt226-5398x",
} as MagicLinkEmailProps;

export default MagicLinkEmail;
