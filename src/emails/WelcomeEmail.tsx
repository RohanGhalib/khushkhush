import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Font,
  Img,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  customerName: string;
  recentProducts: any[];
}

export const WelcomeEmail = ({ customerName, recentProducts }: WelcomeEmailProps) => (
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
    <Preview>Welcome to the KhUShKhUSh. Gang!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={logoText}>KhUShKhUSh.</Heading>
        </Section>
        
        <Section style={card}>
          <Heading style={h1}>WELCOME TO THE GANG.</Heading>
          
          <Text style={text}>
            Yo <strong>{customerName}</strong>,<br />
            You're officially part of the most aggressive streetwear movement. <br />
            No more FOMO. You're now first in line for every drop.
          </Text>

          <Section style={memeBanner}>
             <Text style={urduText}>دنیا گول ہے منافق ماحول ہے</Text>
             <Text style={subUrduText}>YOU ARE NOW PART OF THE MOVEMENT.</Text>
          </Section>

          <Heading as="h2" style={h2}>LATEST DROPS YOU MISSED.</Heading>
          
          <Section style={productGrid}>
            {recentProducts.map((product, i) => (
              <Section key={i} style={productItem}>
                {product.image && (
                  <Img 
                    src={product.image} 
                    alt={product.name_en} 
                    width="150" 
                    height="180" 
                    style={productImage} 
                  />
                )}
                <Text style={productName}>{product.name_en.toUpperCase()}</Text>
                <Text style={productPrice}>Rs. {product.price.toLocaleString()}</Text>
                <Link href={`https://khushkhush.com/product/${product.slug}`} style={shopLink}>
                  SHOP NOW &rarr;
                </Link>
              </Section>
            ))}
          </Section>

          <Section style={footer}>
            <Text style={footerText}>GEN-Z WE'RE COMING!</Text>
            <Link href="https://khushkhush.com/shop" style={mainCta}>GO TO SHOP</Link>
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

const container = {
  margin: "0 auto",
  maxWidth: "600px",
};

const headerSection = {
  textAlign: "center" as const,
  padding: "40px 0",
};

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
};

const h2 = {
  fontSize: "18px",
  fontWeight: "900",
  textTransform: "uppercase" as const,
  margin: "40px 0 20px 0",
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

const urduText = {
  color: "#111111",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
};

const subUrduText = {
  color: "#111111",
  fontSize: "10px",
  fontWeight: "900",
  margin: "5px 0 0 0",
  letterSpacing: "1px",
};

const productGrid = {
  width: "100%",
  marginTop: "20px",
};

const productItem = {
  width: "30%",
  display: "inline-block",
  verticalAlign: "top",
  marginRight: "3%",
  textAlign: "center" as const,
};

const productImage = {
  width: "100%",
  height: "auto",
  border: "1px solid #333333",
  marginBottom: "10px",
};

const productName = {
  fontSize: "12px",
  fontWeight: "bold",
  color: "#FFFFFF",
  margin: "0",
  height: "36px",
  overflow: "hidden",
};

const productPrice = {
  fontSize: "12px",
  color: "#C8FF00",
  margin: "5px 0",
  fontWeight: "bold",
};

const shopLink = {
  fontSize: "10px",
  fontWeight: "900",
  color: "#FFFFFF",
  textDecoration: "underline",
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

const footer = {
  textAlign: "center" as const,
  marginTop: "50px",
};

const footerText = {
  fontSize: "12px",
  fontWeight: "900",
  color: "#666666",
  margin: "0",
  letterSpacing: "2px",
};
