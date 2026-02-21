'use client';

import { useState } from "react";
import emailjs from "@emailjs/browser";
import HomeBackground from "@/components/HomeBackground";
import PageTransition from "@/components/PageTransition";
import styles from "./page.module.css";

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sendError, setSendError] = useState(false);

  const isFormComplete = name.trim() !== '' && email.trim() !== '' && message.trim() !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    setSending(true);
    setSendError(false);

    emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      { from_name: name, from_email: email, message },
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    )
      .then(() => {
        setSuccess(true);
        setName('');
        setEmail('');
        setMessage('');
      })
      .catch(() => setSendError(true))
      .finally(() => setSending(false));
  };

  const form = success ? (
    <p className={styles.successMessage}>Message sent! I&apos;ll get back to you soon.</p>
  ) : (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={styles.input}
      />
      <div className={styles.emailWrapper}>
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setEmailError(false); }}
          className={`${styles.input} ${emailError ? styles.inputError : ''}`}
        />
        {emailError && (
          <span className={styles.errorMessage}>Please enter a valid email address.</span>
        )}
      </div>
      <textarea
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className={styles.textarea}
      />
      {sendError && (
        <span className={styles.errorMessage}>Something went wrong. Please try again.</span>
      )}
      {isFormComplete && (
        <div className={styles.buttonWrapper}>
          <button type="submit" className={styles.submitButton} disabled={sending}>
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      )}
    </form>
  );

  return (
    <>
      {/* Mobile Contact - visible below 768px */}
      <div className="md:hidden">
        <section className={styles.section}>
          <HomeBackground variant="mobile" />
          <PageTransition>
            <div className={styles.container}>
              <h1 className={styles.title}>Get in Touch!</h1>
              {form}
            </div>
          </PageTransition>
        </section>
      </div>

      {/* Desktop Contact - visible at 768px and above */}
      <div className="hidden md:block">
        <section className={styles.section}>
          <HomeBackground variant="desktop" />
          <PageTransition>
            <div className={styles.container}>
              <h1 className={styles.title}>Get in Touch!</h1>
              {form}
            </div>
          </PageTransition>
        </section>
      </div>
    </>
  );
}
