import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Email API Endpoint
  app.post("/api/send-admission-form", async (req, res) => {
    const { 
      studentName, 
      fatherName, 
      motherName, 
      schoolName, 
      className, 
      mobile, 
      religion, 
      shift, 
      studentEmail 
    } = req.body;

    // Use environment variables for security
    const emailUser = process.env.EMAIL_USER || "abuhasan14330@gmail.com";
    const emailPass = process.env.EMAIL_PASS;

    if (!emailPass) {
      console.warn("EMAIL_PASS not set in environment variables. Email sending might fail.");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: `"স্টার কিডস্" <${emailUser}>`,
      to: studentEmail,
      subject: `ভর্তি আবেদন - ${studentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e3a8a;">
          <h2 style="color: #1e3a8a; border-bottom: 2px solid #fbbf24; padding-bottom: 10px;">ভর্তি আবেদন তথ্য</h2>
          <p>প্রিয় শিক্ষার্থী,</p>
          <p>স্টার কিডস্-এ আপনার ভর্তি আবেদনটি প্রাপ্ত হয়েছে। আপনার প্রদানকৃত তথ্যগুলো নিচে দেওয়া হলো:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="background: #f8fafc;">
              <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">ছাত্র/ছাত্রীর নাম</th>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${studentName}</td>
            </tr>
            <tr>
              <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">পিতার নাম</th>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${fatherName}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">মাতার নাম</th>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${motherName}</td>
            </tr>
            <tr>
              <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">স্কুলের নাম</th>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${schoolName}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">শ্রেণী</th>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${className}</td>
            </tr>
            <tr>
              <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">মোবাইল নম্বর</th>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${mobile}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">ধর্ম</th>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${religion}</td>
            </tr>
            <tr>
              <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">শিফট</th>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${shift}</td>
            </tr>
          </table>
          <p style="margin-top: 30px;">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব। আমাদের সাথে থাকার জন্য ধন্যবাদ।</p>
          <div style="margin-top: 40px; font-size: 12px; color: #64748b;">
            <p>স্টার কিডস্ - উজ্জ্বল এক আগামী!</p>
          </div>
        </div>
      `,
    };

    try {
      if (!emailPass || emailPass.trim() === "") {
        return res.status(400).json({ 
          success: false, 
          error: "ইমেইল পাসওয়ার্ড সেট করা নেই। দয়া করে সেটিংস থেকে EMAIL_PASS কনফিগার করুন।" 
        });
      }
      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ success: false, error: "ইমেইল পাঠাতে সমস্যা হয়েছে। পাসওয়ার্ড বা কানেকশন যাচাই করুন।" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting Vite in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware integrated.");
  } else {
    console.log("Starting in production mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Server is starting...`);
    console.log(`[SERVER] Server running on http://localhost:${PORT}`);
    console.log(`[SERVER] NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`[SERVER] App URL: ${process.env.APP_URL || 'Not set'}`);
  });
}

console.log("[SERVER] Starting server script...");
startServer().catch(err => {
  console.error("[SERVER] Failed to start server:", err);
});
