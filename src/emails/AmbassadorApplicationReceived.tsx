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

interface AmbassadorApplicationReceivedProps {
  customerName: string;
  college?: string;
}

export const AmbassadorApplicationReceived = ({
  customerName,
  college,
}: AmbassadorApplicationReceivedProps) => (
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
    <Preview>Form mil gaya. Khusbassador application received.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={logoText}>KhUShKhUSh.</Heading>
        </Section>

        <Section style={card}>
          <Heading style={h1}>FORM MIL GAYA.</Heading>
          <Text style={text}>
            Yo <strong>{customerName}</strong>,<br />
            Your Khusbassador application{college ? ` from ${college}` : ""} just hit our inbox.
            We read everything. Yes, even the cringe pitches.
          </Text>

          <Section style={memeBanner}>
            <Text style={urduText}>صبر کا پھل میٹھا ہوتا ہے</Text>
            <Text style={subUrduText}>SIT TIGHT. WE&apos;LL HIT YOU BACK SOON.</Text>
          </Section>

          <Heading as="h2" style={h2}>WHAT HAPPENS NEXT.</Heading>
          <Text style={text}>
            1. We review your pitch like a manager who&apos;s seen too many.<br />
            2. If you&apos;re in, you get a referral code + your first KhushCoins drop.<br />
            3. If not, no hard feelings. Apply again next semester.
          </Text>

          <Section style={infoBox}>
            <Text style={{ ...text, marginBottom: "0", fontSize: "13px" }}>
              <strong>HEADS UP:</strong> KhushCoins are store credit, not cash. Spend them on drip,
              not biryani.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>GEN-Z WE&apos;RE COMING!</Text>
            <Link href="https://khushkhush.com/ambassador" style={mainCta}>
              READ THE PROGRAM
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
  boxShadow: "10px 10px 0px #C8FF00",
};

const h1 = {
  color: "#FFFFFF",
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
  backgroundColor: "#C8FF00",
  padding: "20px",
  textAlign: "center" as const,
  margin: "30px 0",
  border: "4px solid #111111",
};

const urduText = { color: "#111111", fontSize: "26px", fontWeight: "bold", margin: "0" };

const subUrduText = {
  color: "#111111",
  fontSize: "11px",
  fontWeight: "900",
  margin: "5px 0 0 0",
  letterSpacing: "1px",
};

const infoBox = {
  backgroundColor: "#111111",
  padding: "16px",
  border: "1px solid #333333",
  marginTop: "20px",
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
