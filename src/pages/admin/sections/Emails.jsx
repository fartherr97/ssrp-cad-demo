import { useState } from 'react';
import { AdminPanel, SonButton, SonField, SON_INPUT, ADMIN } from '../AdminKit';
import { MdSave, MdCheckCircle, MdMail } from 'react-icons/md';

function EmailPanel({ title, defaults }) {
  const [header, setHeader] = useState(defaults.header);
  const [subheader, setSubheader] = useState(defaults.subheader);
  const [body, setBody] = useState(defaults.body);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AdminPanel
      title={title}
      right={
        <SonButton
          variant="ghost"
          onClick={() => setPreview(p => !p)}
          style={{
            background: 'transparent',
            border: `1px solid ${ADMIN.borderHi}`,
            color: ADMIN.textDim,
          }}
        >
          <MdMail size={15} />
          {preview ? 'HIDE TEMPLATE' : 'VIEW TEMPLATE'}
        </SonButton>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <SonField label="Header">
          <input
            style={SON_INPUT}
            value={header}
            onChange={e => setHeader(e.target.value)}
          />
        </SonField>
        <SonField label="Subheader">
          <input
            style={SON_INPUT}
            value={subheader}
            onChange={e => setSubheader(e.target.value)}
          />
        </SonField>
        <SonField label="Body">
          <textarea
            style={{ ...SON_INPUT, minHeight: 100, resize: 'vertical', lineHeight: 1.6 }}
            value={body}
            onChange={e => setBody(e.target.value)}
          />
        </SonField>

        <div>
          <SonButton variant="red" onClick={save}>
            {saved ? <MdCheckCircle size={16} /> : <MdSave size={16} />}
            {saved ? 'Saved!' : 'Save'}
          </SonButton>
        </div>
      </div>

      {/* Email preview card */}
      {preview && (
        <div style={{
          marginTop: 20, borderRadius: 10, overflow: 'hidden',
          border: `1px solid ${ADMIN.border}`, background: '#0a1526',
        }}>
          {/* Preview header bar */}
          <div style={{
            padding: '8px 14px', background: ADMIN.panel2,
            borderBottom: `1px solid ${ADMIN.border}`,
            fontSize: 11, color: ADMIN.textMute, fontWeight: 600,
            letterSpacing: '0.5px', textTransform: 'uppercase',
          }}>
            Email Preview
          </div>

          {/* Email card body */}
          <div style={{ padding: '28px 24px', maxWidth: 520, margin: '0 auto' }}>
            {/* Logo placeholder */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: ADMIN.red,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <MdMail size={20} color="#fff" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: ADMIN.text, letterSpacing: '-0.2px' }}>
                Sunshine State Roleplay
              </span>
            </div>

            {/* Header */}
            <div style={{ fontSize: 20, fontWeight: 700, color: ADMIN.text, marginBottom: 8, lineHeight: 1.3 }}>
              {header || <span style={{ color: ADMIN.textMute, fontStyle: 'italic' }}>No header</span>}
            </div>

            {/* Subheader */}
            <div style={{ fontSize: 13, color: ADMIN.textDim, marginBottom: 16 }}>
              {subheader || <span style={{ color: ADMIN.textMute, fontStyle: 'italic' }}>No subheader</span>}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: ADMIN.border, marginBottom: 16 }} />

            {/* Body text */}
            <div style={{ fontSize: 13, color: ADMIN.textDim, lineHeight: 1.7, marginBottom: 24, whiteSpace: 'pre-wrap' }}>
              {body || <span style={{ color: ADMIN.textMute, fontStyle: 'italic' }}>No body text</span>}
            </div>

            {/* CTA button placeholder */}
            <div style={{
              display: 'inline-block', padding: '10px 24px', borderRadius: 8,
              background: ADMIN.red, color: '#fff', fontSize: 13, fontWeight: 700,
              letterSpacing: '0.3px',
            }}>
              Continue →
            </div>

            {/* Footer */}
            <div style={{ marginTop: 28, fontSize: 11, color: ADMIN.textMute, lineHeight: 1.6 }}>
              You are receiving this email because you registered with Sunshine State Roleplay.
              If you did not request this, you can safely ignore this email.
            </div>
          </div>
        </div>
      )}
    </AdminPanel>
  );
}

export default function Emails() {
  return (
    <>
      <EmailPanel
        title="Account Registration Email"
        defaults={{
          header: 'Welcome to Sunshine State Roleplay!',
          subheader: 'Your account has been created successfully.',
          body: 'Thank you for joining the SSRP community. Click the button below to verify your email address and complete your registration.',
        }}
      />
      <EmailPanel
        title="Reset Password Email"
        defaults={{
          header: 'Password Reset Request',
          subheader: 'You requested a password reset.',
          body: 'We received a request to reset your password. Click the button below to choose a new password. This link expires in 24 hours. If you did not request this, you can safely ignore this email.',
        }}
      />
    </>
  );
}
