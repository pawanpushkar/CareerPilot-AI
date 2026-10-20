import { useState } from "react";
import {
  FileText,
  Sparkles,
  Target,
  CheckCircle,
  XCircle,
  Lightbulb,
  Search,
  LoaderCircle,
  Upload,
  FileCheck,
} from "lucide-react";
const API_URL = "http://localhost:5000/api";

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

async function handleResumeUpload(event) {
  const file = event.target.files?.[0];

  // Allow selecting the same file again later.
  event.target.value = "";

  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".pdf") ||
      file.type !== "application/pdf") {
    setError("Please select a valid PDF resume.");
    setUploadMessage("");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setError("The PDF must be smaller than 5 MB.");
    setUploadMessage("");
    return;
  }

  setUploading(true);
  setError("");
  setUploadMessage("");

  try {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await fetch(`${API_URL}/upload-resume`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not extract PDF text.");
    }

    setResumeText(data.resumeText);
    setAnalysis(null);
    setUploadMessage(`Successfully loaded ${file.name}`);
  } catch (err) {
    setError(err.message || "PDF upload failed. Check that the backend is running.");
  } finally {
    setUploading(false);
  }
}

  async function analyzeResume(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await fetch(`${API_URL}/analyze-resume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText,
          jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Resume analysis failed.");
      }

      setAnalysis(data.analysis);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the backend. Make sure your server is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
            <Sparkles size={25} />
          </div>

          <span className="text-sm font-semibold uppercase tracking-wider text-violet-600">
            Powered by Gemini AI
          </span>
        </div>

        <h1 className="text-3xl font-bold text-slate-900">
          AI Resume Analyzer
        </h1>

        <p className="mt-2 text-slate-500">
          Compare your resume with a job description and discover ways to
          improve your chances of getting shortlisted.
        </p>
      </div>

      {/* Input forms */}
    <form
  onSubmit={analyzeResume}
  className="resume-analyzer-form"
>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <FileText className="text-violet-600" size={22} />

            <h2 className="text-lg font-semibold text-slate-900">
              Your Resume
            </h2>
          </div>

          <label
            htmlFor="resumeText"
            className="mb-2 block text-sm text-slate-600"
          >
            Paste your resume text
          </label>

          <div className="mb-4">
  <label
  htmlFor="resumePdf"
  className="resume-upload-label"
>
    {uploading ? (
      <LoaderCircle size={18} className="animate-spin" />
    ) : uploadMessage ? (
      <FileCheck size={18} />
    ) : (
      <Upload size={18} />
    )}

    {uploading ? "Reading PDF..." : "Upload Resume PDF"}
  </label>

  <input
    id="resumePdf"
    type="file"
    accept=".pdf,application/pdf"
    onChange={handleResumeUpload}
    disabled={uploading}
    className="hidden"
  />

  <p className="mt-2 text-xs text-slate-500">
    PDF only · Maximum file size: 5 MB
  </p>

  {uploadMessage && (
    <p className="mt-2 text-sm text-green-700" role="status">
      {uploadMessage}
    </p>
  )}
</div>

          <textarea
            id="resumeText"
            value={resumeText}
            onChange={(event) => setResumeText(event.target.value)}
            placeholder="Paste your resume here, including your skills, education, internships and projects..."
            maxLength={20000}
            required
            className="min-h-80 w-full resize-y rounded-xl border border-slate-200 p-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />

          <p className="mt-2 text-right text-xs text-slate-400">
            {resumeText.length}/20,000 characters
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <Target className="text-blue-600" size={22} />

            <h2 className="text-lg font-semibold text-slate-900">
              Job Description
            </h2>
          </div>

          <label
            htmlFor="jobDescription"
            className="mb-2 block text-sm text-slate-600"
          >
            Paste the target job description
          </label>

          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the job requirements, responsibilities and desired skills..."
            maxLength={12000}
            required
            className="min-h-80 w-full resize-y rounded-xl border border-slate-200 p-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <p className="mt-2 text-right text-xs text-slate-400">
            {jobDescription.length}/12,000 characters
          </p>
        </div>

        <div className="lg:col-span-2">
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-violet-600 px-6 py-4 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle className="animate-spin" size={21} />
                Analyzing your resume...
              </>
            ) : (
              <>
                <Sparkles size={21} />
                Analyze My Resume
              </>
            )}
          </button>

          <p className="mt-3 text-center text-xs text-slate-500">
            AI-generated feedback is an estimate, not a guarantee of
            shortlisting.
          </p>
        </div>
      </form>

      {/* Analysis results */}
      {analysis && (
        <section className="space-y-6">
          <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="flex h-36 w-36 shrink-0 flex-col items-center justify-center rounded-full border-8 border-violet-100">
                <span className="text-4xl font-bold text-violet-700">
                  {analysis.matchScore}%
                </span>

                <span className="mt-1 text-xs text-slate-500">
                  Match score
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Your Resume Results
                </h2>

                <p className="mt-3 leading-7 text-slate-600">
                  {analysis.summary}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Matching skills */}
            <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <CheckCircle className="text-green-600" />
                Matching Skills
              </h3>

              <div className="flex flex-wrap gap-2">
                {analysis.matchingSkills?.length ? (
                  analysis.matchingSkills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-full bg-green-50 px-3 py-2 text-sm text-green-700"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No matching skills identified.
                  </p>
                )}
              </div>
            </div>

            {/* Missing skills */}
            <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <XCircle className="text-red-600" />
                Skills to Improve
              </h3>

              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills?.length ? (
                  analysis.missingSkills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-full bg-red-50 px-3 py-2 text-sm text-red-700"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No missing skills identified.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ATS keywords */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Search className="text-blue-600" />
              Recommended ATS Keywords
            </h3>

            <div className="flex flex-wrap gap-2">
              {analysis.atsKeywords?.length ? (
                analysis.atsKeywords.map((keyword, index) => (
                  <span
                    key={`${keyword}-${index}`}
                    className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700"
                  >
                    {keyword}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No additional keywords identified.
                </p>
              )}
            </div>
          </div>

          {/* Improvement suggestions */}
          <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Lightbulb className="text-amber-600" />
              Improvement Suggestions
            </h3>

            <ul className="space-y-3">
              {analysis.suggestions?.length ? (
                analysis.suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                  >
                    <CheckCircle
                      size={18}
                      className="mt-1 shrink-0 text-amber-600"
                    />

                    <span>{suggestion}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-500">
                  No suggestions returned.
                </li>
              )}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => {
              setAnalysis(null);
              setError("");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Analyze Another Resume
          </button>
        </section>
      )}
    </div>
  );
}