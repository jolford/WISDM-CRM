import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Button,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface WelcomeEmailProps {
  firstName: string
  email: string
  temporaryPassword: string
  loginUrl: string
  role: string
}

export const WelcomeEmail = ({
  firstName,
  email,
  temporaryPassword,
  loginUrl,
  role,
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to the CRM System - Your account has been created</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to CRM System!</Heading>
        <Text style={text}>
          Hello {firstName || 'there'},
        </Text>
        <Text style={text}>
          Your account has been created with the role of <strong>{role}</strong>. 
          You can now access the CRM system using the credentials below.
        </Text>
        
        <div style={credentialsBox}>
          <Text style={credentialsTitle}>Your Login Credentials:</Text>
          <Text style={credentialsText}>
            <strong>Email:</strong> {email}
          </Text>
          <Text style={credentialsText}>
            <strong>Temporary Password:</strong> <code style={code}>{temporaryPassword}</code>
          </Text>
        </div>

        <Text style={text}>
          <strong>Important:</strong> Please change your password after your first login for security.
        </Text>

        <Button
          href={loginUrl}
          style={button}
        >
          Login to CRM System
        </Button>

        <Text style={footerText}>
          If you have any questions, please contact your administrator.
        </Text>
        
        <Text style={footer}>
          This email was sent from the CRM System. If you didn't expect this email, please contact your administrator.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default WelcomeEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
}

const h1 = {
  color: '#1a202c',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const credentialsBox = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const credentialsTitle = {
  color: '#1a202c',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
}

const credentialsText = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0',
}

const code = {
  backgroundColor: '#1f2937',
  color: '#f9fafb',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '14px',
  fontFamily: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
}

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  margin: '32px 0',
}

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 16px',
  fontStyle: 'italic',
}

const footer = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '32px 0 0',
  textAlign: 'center' as const,
}