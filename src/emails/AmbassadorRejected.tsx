import {
  Body,
  Container,
  Font,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface AmbassadorRejectedProps {
  customerName: string;
}

export const AmbassadorRejected = ({ customerName }: AmbassadorRejectedProps) => (
  <Html>
    <Head>
      <Font
        fontFamily="Twenly"
        fallbackFontFamily="Arial"
        webFont={{
          url: "https://khushkhush.com/fonts/Twelny-BF661c3bbd2a8b3.ttf",
          format: "truetype",
        }}
        fontWeight={900}
        fontStyle="normal"
      />
    </Head>
    <Preview>Not this time. Try again next semester.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={logoText}>KhUShKhUSh.</Heading>
        </Section>

        <Section style={card}>
          <Heading style={h1}>NOT THIS TIME.</Heading>
          <Text style={text}>
            Yo <strong>{customerName}</strong>,<br />
            We loved that you applied. We&apos;re not slotting you into the program right now.<br />
            That&apos;s not personal. The campus quota is tight.
          </Text>

          <Section style={memeBanner}>
            <Text style={urduText}>منافق ماحول ہے</Text>
            <Text style={subUrduText}>NEXT ROUND. KEEP MOVING.</Text>
          </Section>

          <Heading as="h2" style={h2}>WHAT TO DO.</Heading>
          <Text style={text}>
            1. Build the audience. Tag us when you wear our drops.<br />
            2. Reapply next semester. Pitches with proof get accepted.<br />
            3. Until then, you still get the regular drops and newsletter.
          </Text>

          <Section style={footer}>
            <Text style={footerText}>NO HARD FEELINGS.</Text>
            <Link href="https://khushkhush.com/shop" style={mainCta}>
              GO TO SHOP
            </Link>
          </Section>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#111111",
  color: "#FFFFFF",
  fontFamily: 'Twenly, "Helvetica Neue", Helvetica, Arial, sans-serif',
  padding: "20px 0",
};

const container = { margin: "0 auto", maxWidth: "600px" };

const headerSection = { textAlign: "center" as const, padding: "40px 0" };

const logoText = {
  color: "#C8FF00",
  fontSize: "42px",
  fontWeight: "900",
  margin: "0",
  letterSpacing: "-1px",
};

const card = {
  backgroundColor: "#1A1A1A",
  border: "2px solid #333333",
  padding: "40px",
  boxShadow: "10px 10px 0px #FF4444",
};

const h1 = {
  color: "#FF4444",
  fontSize: "32px",
  fontWeight: "900",
  textTransform: "uppercase" as const,
  margin: "0 0 24px 0",
  letterSpacing: "1px",
};

const h2 = {
  fontSize: "18px",
  fontWeight: "900",
  textTransform: "uppercase" as const,
  margin: "30px 0 16px 0",
  borderBottom: "2px solid #333333",
  paddingBottom: "10px",
  color: "#C8FF00",
};

const text = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#CCCCCC",
  margin: "0 0 20px 0",
};

const memeBanner = {
  backgroundColor: "#FF4444",
  padding: "20px",
  textAlign: "center" as const,
  margin: "30px 0",
  border: "4px solid #111111",
};

const urduText = { color: "#FFFFFF", fontSize: "26px", fontWeight: "bold", margin: "0" };

const subUrduText = {
  color: "#FFFFFF",
  fontSize: "11px",
  fontWeight: "900",
  margin: "5px 0 0 0",
  letterSpacing: "1px",
};

const mainCta = {
  backgroundColor: "#C8FF00",
  color: "#111111",
  padding: "16px 32px",
  fontSize: "18px",
  fontWeight: "900",
  textDecoration: "none",
  display: "inline-block",
  marginTop: "20px",
  border: "2px solid #111111",
};

const footer = { textAlign: "center" as const, marginTop: "40px" };

const footerText = {
  fontSize: "12px",
  fontWeight: "900",
  color: "#666666",
  margin: "0",
  letterSpacing: "2px",
};
