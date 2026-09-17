import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface WelcomeEmailProps {
  name: string
  referralCode: string
}

export default function WelcomeEmail({
  name = 'Beautiful',
  referralCode = 'FAMI-XXXX',
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to FaMi. Curated elegance awaits.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>FaMi</Text>
          </Section>
          
          <Section style={bodySection}>
            <Heading style={heading}>Welcome to FaMi, {name}.</Heading>
            <Text style={paragraph}>
              We are delighted to have you. At FaMi, we believe that true elegance lies in the details. 
              Our curated collections of fine jewelry, bespoke bags, and premium skincare are crafted for the discerning eye.
            </Text>
            
            <Section style={callout}>
              <Text style={calloutText}>
                <strong>Your Personal Referral Code:</strong> {referralCode}
              </Text>
              <Text style={calloutSubtext}>
                Share this code with a friend. When they place their first order, you both earn exclusive loyalty points.
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Link style={button} href="https://fami-rebuild.vercel.app/shop">
                Explore the Collection
              </Link>
            </Section>

            <Text style={paragraph}>
              If you ever need assistance, our concierges are always here for you. Simply reply to this email.
            </Text>
            
            <Text style={signoff}>
              Warmest regards,
              <br />
              The FaMi Team
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Ac {new Date().getFullYear()} FaMi. All rights reserved.
            </Text>
            <Text style={footerText}>
              Dhaka, Bangladesh
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ── Styles ────────────────────────────────────────────────────────────
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: 'HelveticaNeue, Helvetica, Arial, sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '40px 0',
  width: '600px',
  maxWidth: '100%',
}

const header = {
  backgroundColor: '#2b1c24', // ink-plum
  padding: '30px',
  textAlign: 'center' as const,
  borderRadius: '8px 8px 0 0',
}

const logoText = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '500',
  letterSpacing: '2px',
  margin: '0',
}

const bodySection = {
  backgroundColor: '#ffffff',
  padding: '40px',
  borderLeft: '1px solid #e0e0e0',
  borderRight: '1px solid #e0e0e0',
}

const heading = {
  fontSize: '24px',
  color: '#1a1a1a',
  fontWeight: 'normal',
  marginBottom: '24px',
}

const paragraph = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#4a4a4a',
  marginBottom: '24px',
}

const callout = {
  backgroundColor: '#f9f9f9',
  padding: '20px',
  borderRadius: '4px',
  marginBottom: '24px',
  textAlign: 'center' as const,
  border: '1px solid #e0e0e0',
}

const calloutText = {
  fontSize: '16px',
  color: '#1a1a1a',
  margin: '0 0 8px 0',
}

const calloutSubtext = {
  fontSize: '13px',
  color: '#8a8a8a',
  margin: '0',
  lineHeight: '20px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const button = {
  backgroundColor: '#2b1c24',
  color: '#ffffff',
  padding: '12px 32px',
  borderRadius: '2px',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
}

const signoff = {
  fontSize: '15px',
  color: '#1a1a1a',
  lineHeight: '24px',
}

const footer = {
  backgroundColor: '#ffffff',
  padding: '24px 40px',
  borderTop: '1px solid #e0e0e0',
  borderLeft: '1px solid #e0e0e0',
  borderRight: '1px solid #e0e0e0',
  borderBottom: '1px solid #e0e0e0',
  borderRadius: '0 0 8px 8px',
  textAlign: 'center' as const,
}

const footerText = {
  fontSize: '12px',
  color: '#8a8a8a',
  margin: '4px 0',
}
