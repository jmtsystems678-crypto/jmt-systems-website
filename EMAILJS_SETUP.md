# Free EmailJS notifications for JMT

This sends a notification to **jmtsystems678@gmail.com** whenever a visitor submits a project request or Paystack confirms a program payment. No custom domain is required.

## 1. Create the free EmailJS account

1. Go to [EmailJS](https://www.emailjs.com/) and create an account.
2. Open **Email Services** > **Add New Service** > choose **Gmail**.
3. Connect the official Gmail account: `jmtsystems678@gmail.com`.
4. Copy the new **Service ID** (for example, `service_ab12cd3`).

## 2. Create the JMT notification template

1. In EmailJS, open **Email Templates** > **Create New Template**.
2. Set **To Email** to exactly: `jmtsystems678@gmail.com`.
3. Use this subject:

   `JMT website: {{notification_type}} — {{full_name}}`

4. Use this message:

   ```text
   A new JMT website notification has arrived.

   Type: {{notification_type}}
   Name: {{full_name}}
   Email: {{email}}
   Phone: {{phone}}
   Service: {{service}}
   Program: {{program}}
   Amount: {{amount}}
   Payment channel: {{payment_channel}}
   Paystack reference: {{payment_reference}}

   Client details:
   {{project_details}}
   ```

5. Save it and copy its **Template ID** (for example, `template_ab12cd3`).

## 3. Get the EmailJS keys

In **Account** > **General**, copy the **Public Key** and **Private Key**. Keep the private key secret.

## 4. Add these Vercel variables

In Vercel: **JMT Systems project** > **Settings** > **Environment Variables**, add the following for **Production**:

| Name | EmailJS value |
|---|---|
| `EMAILJS_SERVICE_ID` | Service ID |
| `EMAILJS_TEMPLATE_ID` | Template ID |
| `EMAILJS_PUBLIC_KEY` | Public Key |
| `EMAILJS_PRIVATE_KEY` | Private Key |

Do not put the private key in `app-config.js`, on the website, or in chat.

## 5. Redeploy, then test

Deploy this updated `outputs` folder to the current Vercel project. If needed, open **Deployments**, select the newest Ready deployment, then choose **Promote to Production**.

1. Submit a test project request on the live site. It will be saved and the official Gmail should receive all details.
2. Make a successful Paystack payment. Once Paystack verifies it, the official Gmail should receive the payment/registration details.

If an email is not received, open EmailJS **History**. It shows whether EmailJS accepted the message or Gmail returned an error.

## Notes

EmailJS is appropriate for JMT's low-volume starting phase. It has free-plan and rate limits. The private key is stored only in Vercel, so visitors cannot access it.
