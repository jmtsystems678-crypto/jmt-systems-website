# Automatic email confirmations

JMT's payment verification already works. This optional addition sends a professional email only after Paystack verifies that payment succeeded.

1. Create an account at https://resend.com and verify a sender domain. You can use a JMT domain when one is available.
2. In Resend, create an API key with **Sending access**.
3. In Vercel → Environment Variables, add these Production variables:

```
RESEND_API_KEY = your Resend API key
EMAIL_FROM = JMT Systems <registrations@your-verified-domain.com>
```

Do not put either value in the website files or send the API key in chat. After adding them, deploy the `outputs` folder to the current JMT Systems Vercel project.

If these two variables are not configured, payment and registration continue to work normally; only the automatic email is skipped.
