/**
 * Service to generate beautiful branded HTML templates.
 */

const siteUrl = "https://vidyapeeth.in";
const logoUrl = `${siteUrl}/logo.png`; // Update to actual logo URL
const brandColor = "#1B2A4A"; // Navy

export function generateEmailHtml(title: string, bodyContent: string, showUnsubscribe = false) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 32px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { text-align: center; margin-bottom: 32px; }
        .header img { max-height: 48px; }
        .content { color: #374151; line-height: 1.6; font-size: 16px; }
        .content h1 { color: ${brandColor}; font-size: 24px; margin-bottom: 16px; }
        .content h2 { color: ${brandColor}; font-size: 20px; margin-bottom: 12px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #FBBF24; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 24px; }
        .footer { margin-top: 48px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 24px; }
        .footer a { color: ${brandColor}; text-decoration: none; }
        .unsubscribe { margin-top: 16px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div style="padding: 32px 0;">
        <div class="container">
          <div class="header">
            <h2 style="color: ${brandColor}; font-weight: 900; margin: 0; font-size: 28px;">VIDYAPEETH</h2>
          </div>
          <div class="content">
            ${bodyContent}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Vidyapeeth Education. All rights reserved.</p>
            <p>Vikaspuri, New Delhi</p>
            <p>
              <a href="${siteUrl}">Website</a> | 
              <a href="${siteUrl}/contact">Contact Us</a>
            </p>
            ${showUnsubscribe ? `
              <p class="unsubscribe">
                You received this email because you are subscribed to our newsletter or blog.
                <br>
                <a href="${siteUrl}/unsubscribe">Unsubscribe from all marketing emails</a>
              </p>
            ` : ""}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export const emailTemplates = {
  demoBookingAdmin: (data: any) => generateEmailHtml(
    "New Demo Booking",
    `
      <h1>New Demo Booking</h1>
      <p>A new student has booked a free demo class.</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Name:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.studentName}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Class:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.classLevel}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.email}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.parentPhone}</td></tr>
      </table>
      <a href="${siteUrl}/admin/demo-requests" class="button">View in Admin Panel</a>
    `
  ),
  demoBookingUser: (name: string) => generateEmailHtml(
    "Your Demo Class is Booked!",
    `
      <h1>Hi ${name},</h1>
      <p>Your free 60-minute demo class with a Vidyapeeth mentor is confirmed!</p>
      <p>We're thrilled to show you how learning can be interactive, engaging, and highly personalized.</p>
      <p>One of our academic counselors will call you shortly to confirm the exact time that works best for you and your child.</p>
      <p>If you have any immediate questions, feel free to reply directly to this email or call us.</p>
    `
  ),
  contactAutoReply: (name: string) => generateEmailHtml(
    "We received your message",
    `
      <h1>Hi ${name},</h1>
      <p>Thanks for reaching out to the Vidyapeeth team.</p>
      <p>We have received your message and one of our academic counselors will get back to you within 24 hours.</p>
      <p>In the meantime, feel free to explore our <a href="${siteUrl}/courses">Courses</a> or our <a href="${siteUrl}/blog">Blog</a>.</p>
    `
  ),
  vsatRegistrationAdmin: (data: any) => generateEmailHtml(
    "New VSAT Registration",
    `
      <h1>New VSAT Registration</h1>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Name:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.studentName}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Class:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.classLevel}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.email}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${data.phone}</td></tr>
      </table>
      <a href="${siteUrl}/admin/vsat-registrations" class="button">View in Admin Panel</a>
    `
  ),
  newsletterWelcome: () => generateEmailHtml(
    "Welcome to the Vidyapeeth Newsletter!",
    `
      <h1>Welcome to the Vidyapeeth Newsletter!</h1>
      <p>Thank you for subscribing.</p>
      <p>You can expect the best study tips, parenting notes, and exam guides straight to your inbox.</p>
      <p>If you have any topics you'd like us to cover, just reply to this email!</p>
    `,
    true
  ),
  blogPublished: (title: string, excerpt: string, slug: string, imageUrl?: string) => generateEmailHtml(
    title,
    `
      ${imageUrl ? `<img src="${imageUrl}" alt="${title}" style="width: 100%; border-radius: 8px; margin-bottom: 16px;" />` : ""}
      <h1>${title}</h1>
      <p>${excerpt || "Read our latest article."}</p>
      <a href="${siteUrl}/blog/${slug}" class="button">Read Full Article</a>
    `,
    true
  )
};
