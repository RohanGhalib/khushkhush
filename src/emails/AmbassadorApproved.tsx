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

interface AmbassadorApprovedProps {
  customerName: string;
  referralCode: string;
  coinsPerShirt: number;
  customerDiscountPerShirt: number;
}

export const AmbassadorApproved = ({
  customerName,
  referralCode,
  coinsPerShirt,
  customerDiscountPerShirt,
}: AmbassadorApprovedProps) => (
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
    <Preview>You are IN. Khusbassador code locked.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={logoText}>KhUShKhUSh.</Heading>
        </Section>

        <Section style={card}>
          <Heading style={h1}>YOU ARE IN.</Heading>
          <Text style={text}>
            Yo <strong>{customerName}</strong>,<br />
            Application reviewed. Pitch survived. You&apos;re officially a Khusbassador.<br />
            Now don&apos;t make us look bad.
          </Text>

          <Section style={memeBanner}>
            <Text style={urduText}>کیمپس تمہارا ہے</Text>
            <Text style={subUrduText}>YOUR REFERRAL CODE IS LIVE.</Text>
          </Section>

          <Section style={codeBox}>
            <Text style={codeLabel}>YOUR CODE</Text>
            <Text style={codeText}>{referralCode}</Text>
            <Text style={codeHint}>
              Share it. Customers save Rs. {customerDiscountPerShirt}/shirt. You stack {coinsPerShirt} coins/shirt.
            </Text>
          </Section>

          <Heading as="h2" style={h2}>HOW THE COINS DROP.</Heading>
          <Text style={text}>
            Every shirt sold with your code drops <strong style={highlight}>{coinsPerShirt} KhushCoins</strong> into your vault.
            Spend them at checkout for store credit. <strong>1 coin = Rs. 1.</strong> No cashout.
            No bank transfer. Just drip.
          </Text>

          <Section style={infoBox}>
            <Text style={{ ...text, marginBottom: "0", fontSize: "13px" }}>
              <strong>RULES:</strong><br />
              - Cap of 50% of subtotal per order.<br />
              - Account-bound. No trading, no transfers.<br />
              - Don&apos;t self-refer. We see everything.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>GEN-Z WE&apos;RE COMING!</Text>
            <Link href="https://khushkhush.com/account/vault" style={mainCta}>
              GO TO YOUR VAULT
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
  color: "#C8FF00",
  fontSize: "36px",
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

const highlight = { color: "#C8FF00", fontWeight: 900 as const };

const memeBanner = {
  backgroundColor: "#C8FF00",
  padding: "20px",
  textAlign: "center" as const,
  margin: "30px 0",
  border: "4px solid #111111",
};

const urduText = { color: "#111111", fontSize: "28px", fontWeight: "bold", margin: "0" };

const subUrduText = {
  color: "#111111",
  fontSize: "12px",
  fontWeight: "900",
  margin: "5px 0 0 0",
  letterSpacing: "1px",
};

const codeBox = {
  backgroundColor: "#111111",
  border: "4px dashed #C8FF00",
  padding: "24px",
  margin: "20px 0",
  textAlign: "center" as const,
};

const codeLabel = {
  color: "#666666",
  fontSize: "11px",
  fontWeight: "900",
  letterSpacing: "3px",
  margin: "0 0 8px 0",
};

const codeText = {
  color: "#C8FF00",
  fontSize: "44px",
  fontWeight: "900",
  letterSpacing: "2px",
  margin: "0",
};

const codeHint = {
  color: "#888888",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "1px",
  margin: "10px 0 0 0",
  textTransform: "uppercase" as const,
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
