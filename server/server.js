const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { PDFParse } = require("pdf-parse");
require("dotenv").config();
const pool = require("./db");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const app = express();
const PORT = process.env.PORT || 5000;
// PDF resume upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Maximum 5 MB
  },
  fileFilter: (req, file, callback) => {
    if (
      file.mimetype === "application/pdf" &&
      file.originalname.toLowerCase().endsWith(".pdf")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Please upload a PDF file."));
    }
  },
});

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to CareerPilot AI API!",
    status: "running",
  });
});

// Backend health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CareerPilot AI backend is healthy",
  });
});

// Database health check
app.get("/api/db-health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS database_time");

    res.json({
      success: true,
      message: "PostgreSQL connected successfully!",
      databaseTime: result.rows[0].database_time,
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed.",
    });
  }
});

// Create applications table
app.post("/api/setup-database", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        company VARCHAR(150) NOT NULL,
        role VARCHAR(150) NOT NULL,
        status VARCHAR(50) DEFAULT 'Applied',
        location VARCHAR(150),
        job_url TEXT,
        notes TEXT,
        applied_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    res.json({
      success: true,
      message: "Applications table is ready!",
    });
  } catch (error) {
    console.error("Table creation error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not create applications table.",
    });
  }
});

// GET: Retrieve all applications
app.get("/api/applications", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM applications ORDER BY created_at DESC"
    );

    res.json({
      success: true,
      applications: result.rows,
    });
  } catch (error) {
    console.error("Fetch error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not retrieve applications.",
    });
  }
});

// POST: Add an application
app.post("/api/applications", async (req, res) => {
  try {
    const {
      company,
      role,
      status = "Applied",
      location = "",
      job_url = "",
      notes = "",
    } = req.body;

    if (
      typeof company !== "string" ||
      !company.trim() ||
      typeof role !== "string" ||
      !role.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Company and role are required.",
      });
    }

    const result = await pool.query(
      `INSERT INTO applications
       (company, role, status, location, job_url, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        company.trim(),
        role.trim(),
        status,
        location,
        job_url,
        notes,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Application added successfully!",
      application: result.rows[0],
    });
  } catch (error) {
    console.error("Add application error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not add application.",
    });
  }
});

// PUT: Update an application
app.put("/api/applications/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company,
      role,
      status,
      location,
      job_url,
      notes,
    } = req.body;

    const result = await pool.query(
      `UPDATE applications
       SET company = COALESCE($1, company),
           role = COALESCE($2, role),
           status = COALESCE($3, status),
           location = COALESCE($4, location),
           job_url = COALESCE($5, job_url),
           notes = COALESCE($6, notes)
       WHERE id = $7
       RETURNING *`,
      [company, role, status, location, job_url, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    res.json({
      success: true,
      message: "Application updated successfully!",
      application: result.rows[0],
    });
  } catch (error) {
    console.error("Update application error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not update application.",
    });
  }
});

// DELETE: Remove an application
app.delete("/api/applications/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM applications WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    res.json({
      success: true,
      message: "Application deleted successfully!",
    });
  } catch (error) {
    console.error("Delete application error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not delete application.",
    });
  }
});

// Upload PDF and extract resume text
app.post("/api/upload-resume", (req, res) => {
  upload.single("resume")(req, res, async (uploadError) => {
    if (uploadError) {
      return res.status(400).json({
        success: false,
        message: uploadError.message || "Could not upload PDF.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a PDF resume.",
      });
    }

    let parser;

    try {
      parser = new PDFParse({
        data: req.file.buffer,
      });

      const result = await parser.getText();
      const resumeText = result.text?.trim();

      if (!resumeText) {
        return res.status(400).json({
          success: false,
          message:
            "No readable text found. Please upload a text-based PDF.",
        });
      }

      if (resumeText.length > 20000) {
        return res.status(400).json({
          success: false,
          message: "The extracted resume text exceeds 20,000 characters.",
        });
      }

      return res.json({
        success: true,
        message: "Resume PDF processed successfully.",
        resumeText,
      });
    } catch (error) {
      console.error("PDF extraction error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Could not read this PDF. Please try another file.",
      });
    } finally {
      if (parser) {
        await parser.destroy().catch(() => {});
      }
    }
  });
});

// AI Resume Analyzer
app.post("/api/analyze-resume", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    // Validate input
    if (
      typeof resumeText !== "string" ||
      typeof jobDescription !== "string" ||
      !resumeText.trim() ||
      !jobDescription.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide both resume text and job description.",
      });
    }

    if (resumeText.length > 20000 || jobDescription.length > 12000) {
      return res.status(400).json({
        success: false,
        message:
          "Resume must be under 20,000 characters and job description under 12,000 characters.",
      });
    }

    const prompt = `
You are an expert resume reviewer and ATS optimization assistant.

Analyze the resume against the job description below.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Return ONLY a valid JSON object with this exact structure:
{
  "matchScore": 75,
  "summary": "A short assessment of the candidate's suitability.",
  "matchingSkills": ["JavaScript", "React"],
  "missingSkills": ["Docker", "AWS"],
  "atsKeywords": ["REST API", "Agile"],
  "suggestions": [
    "Add measurable achievements to project descriptions.",
    "Include relevant keywords where they accurately reflect your experience."
  ]
}

Rules:
- matchScore must be an integer from 0 to 100.
- Use evidence from the provided resume and job description.
- Do not invent qualifications or experience.
- Identify missing skills honestly.
- Give practical, specific suggestions.
- Return valid JSON only, without Markdown fences.
`;

   let response;
let lastError;

for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    break;
  } catch (error) {
    lastError = error;

    const message = String(error.message || error);

    const retryable =
      message.includes("503") ||
      message.includes("UNAVAILABLE") ||
      message.includes("429") ||
      message.includes("RESOURCE_EXHAUSTED");

    if (!retryable || attempt === 3) {
      throw error;
    }

    console.log(`Gemini temporarily unavailable. Retry ${attempt}/3...`);

    await new Promise((resolve) =>
      setTimeout(resolve, attempt * 2000)
    );
  }
}

if (!response) {
  throw lastError || new Error("Gemini did not return a response.");
}
    const responseText = response.text;

    if (!responseText) {
      throw new Error("Gemini returned an empty response.");
    }

    const analysis = JSON.parse(responseText);

    // Validate the most important response fields
    if (
      typeof analysis.matchScore !== "number" ||
      !Number.isFinite(analysis.matchScore) ||
      analysis.matchScore < 0 ||
      analysis.matchScore > 100
    ) {
      throw new Error("Gemini returned an invalid match score.");
    }

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Resume analysis error:", error.message);

    res.status(500).json({
      success: false,
      message:
        "Resume analysis failed. Check the Gemini API configuration and server terminal.",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`CareerPilot AI API running on port ${PORT}`);
});