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
} from "@react-email/components";
import * as React from "react";

interface OrderStatusUpdateProps {
  orderId: string;
  customerName: string;
  status: "Shipped" | "Delivered" | "Cancelled";
}

export const OrderStatusUpdate = ({ orderId, customerName, status }: OrderStatusUpdateProps) => {
  const isCancelled = status === "Cancelled";
  
  const statusConfig = {
    Shipped: {
      title: "ON THE MOVE.",
      urdu: "راستہ صاف ہے مڈی تیار رکھو",
      sub: "YOUR ORDER IS ON ITS WAY TO YOU.",
      color: "#C8FF00",
    },
    Delivered: {
      title: "TOUCHDOWN.",
      urdu: "مبارک ہو پارسل پہنچ گیا",
      sub: "YOUR ORDER HAS BEEN DELIVERED.",
      color: "#C8FF00",
    },
    Cancelled: {
      title: "ORDER KILLED.",
      urdu: "منافق ماحول ہے آرڈر کینسل ہو گیا",
      sub: "YOUR ORDER HAS BEEN CANCELLED.",
      color: "#FF4444",
    },
  };

  const config = statusConfig[status];

  return (
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
      <Preview>Order #{orderId} - {config.title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={logoText}>KhUShKhUSh.</Heading>
          </Section>
          
          <Section style={{ ...card, boxShadow: `10px 10px 0px ${config.color}` }}>
            <Heading style={{ ...h1, color: config.color }}>{config.title}</Heading>
            
            <Text style={text}>
              Yo <strong>{customerName}</strong>,<br />
              Update regarding your order <span style={{ color: config.color, fontWeight: "bold" }}>#{orderId}</span>.
            </Text>

            <Section style={{ ...memeBanner, backgroundColor: config.color }}>
               <Text style={urduText}>{config.urdu}</Text>
               <Text style={subUrduText}>{config.sub}</Text>
            </Section>

            {isCancelled ? (
              <Text style={text}>
                Something went wrong and your order was cancelled. <br />
                If you think this is a mistake, hit us up.
              </Text>
            ) : (
              <Text style={text}>
                {status === "Shipped" 
                  ? "Our rider is on the move. Keep your phone close and the cash ready." 
                  : "Enjoy your new drip. Tag us @khushkhush.pk to get featured."}
              </Text>
            )}

            <Section style={footer}>
              <Text style={footerText}>GEN-Z WE'RE COMING!</Text>
              <Link href="https://khushkhush.com/account/orders" style={{ ...mainCta, backgroundColor: config.color }}>VIEW ORDER</Link>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

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
};

const card = {
  backgroundColor: "#1A1A1A",
  border: "2px solid #333333",
  padding: "40px",
};

const h1 = {
  fontSize: "32px",
  fontWeight: "900",
  textTransform: "uppercase" as const,
  margin: "0 0 24px 0",
};

const text = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#CCCCCC",
  margin: "0 0 20px 0",
};

const memeBanner = {
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

const mainCta = {
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
};
