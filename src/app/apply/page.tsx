"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type MinistryType = "Church" | "Nonprofit" | "Business" | "Ministry" | "";

interface FormData {
  // Step 1 — Contact
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mailingAddress: string;
  churchName: string;

  // Step 2 — Location
  city: string;
  cohort: string;

  // Step 3 — Ministry
  ministryName: string;
  ministryWebsite: string;
  ministryType: MinistryType;
  ministryDescription: string;
  faithStory: string;
  gospelExperience: string;
  programGoals: string;
  hearAbout: string;

  // Step 4 — Agreement
  agreement: "agree" | "disagree" | "";
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  mailingAddress: "",
  churchName: "",
  city: "",
  cohort: "",
  ministryName: "",
  ministryWebsite: "",
  ministryType: "",
  ministryDescription: "",
  faithStory: "",
  gospelExperience: "",
  programGoals: "",
  hearAbout: "",
  agreement: "",
};

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const CITIES = [
  "Bay Area CA",
  "Chicago IL",
  "Dallas TX",
  "Houston TX",
  "Milwaukee WI",
  "Southern California",
  "St. Louis",
  "Twin Cities MN",
  "Las Vegas NV",
];

const COHORTS = [
  "Spring 2026 Cohort",
  "Fall 2026 Cohort",
];

const MINISTRY_TYPES: MinistryType[] = ["Church", "Nonprofit", "Business", "Ministry"];

const STEP_LABELS = ["Contact", "Location", "Ministry", "Agreement", "Review"];

const LEGAL_TEXT = `LINC Mission Accelerator — Participation Agreement & Media Release

By participating in the LINC Mission Accelerator program, you agree to the following terms:

Participation: You understand this is a voluntary program and that LINC reserves the right to modify or discontinue the program at any time. Participation does not guarantee funding, partnerships, or any specific outcome.

Liability Waiver: You agree to release LINC, its staff, volunteers, and partner organizations from any claims arising from your participation in the program or use of the Impact360 platform.

Media Release: You grant LINC permission to use your name, photo, and venture information for promotional materials, reports, and communications related to the program, unless you notify us otherwise in writing.

Data Use: Information you submit will be used to evaluate your application, support your participation, and improve the program. We will not sell your information to third parties.

Accuracy: You confirm that all information provided in this application is accurate and complete to the best of your knowledge.`;

// ─────────────────────────────────────────────
// Shared input class
// ─────────────────────────────────────────────

const inputClass =
  "w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 transition-colors";

const selectClass =
  "w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2.5 text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 transition-colors cursor-pointer appearance-none";

const labelClass = "text-sm font-medium text-stone-300";
const helperClass = "text-xs text-stone-500 mt-1";
const errorClass = "text-xs text-rose-400 mt-1";

// ─────────────────────────────────────────────
// Progress indicator
// ─────────────────────────────────────────────

function ProgressIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="flex items-start justify-center gap-1 sm:gap-2 mb-10">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1;
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;
        const isUpcoming = step > currentStep;

        return (
          <div key={step} className="flex flex-col items-center gap-1.5">
            <div className="flex items-center">
              {/* Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  isCompleted
                    ? "bg-amber-500 text-stone-900"
                    : isActive
                    ? "bg-amber-500 text-stone-900 ring-4 ring-amber-500/20"
                    : "bg-stone-800 border border-stone-700 text-stone-500"
                }`}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                ) : (
                  step
                )}
              </div>

              {/* Connector line */}
              {step < totalSteps && (
                <div
                  className={`hidden sm:block w-8 lg:w-12 h-px mx-1 ${
                    step < currentStep ? "bg-amber-500/50" : "bg-stone-800"
                  }`}
                />
              )}
            </div>

            {/* Label */}
            <span
              className={`text-[10px] font-medium tracking-wide ${
                isActive
                  ? "text-amber-400"
                  : isCompleted
                  ? "text-stone-400"
                  : "text-stone-600"
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Step 1 — Contact
// ─────────────────────────────────────────────

function Step1({
  formData,
  onChange,
  errors,
}: {
  formData: FormData;
  onChange: (field: keyof FormData, value: string) => void;
  errors: Partial<Record<keyof FormData, string>>;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl text-stone-50 mb-1">
          Let&apos;s start with you
        </h2>
        <p className="text-sm text-stone-500">
          Tell us a little about yourself so we can connect you with the right
          people.
        </p>
      </div>

      {/* First + Last name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            First Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            className={`${inputClass} mt-1.5`}
            placeholder="Maria"
            value={formData.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
          />
          {errors.firstName && (
            <p className={errorClass}>{errors.firstName}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>
            Last Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            className={`${inputClass} mt-1.5`}
            placeholder="Torres"
            value={formData.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
          />
          {errors.lastName && (
            <p className={errorClass}>{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className={labelClass}>
          Email <span className="text-rose-400">*</span>
        </label>
        <input
          type="email"
          className={`${inputClass} mt-1.5`}
          placeholder="maria@example.com"
          value={formData.email}
          onChange={(e) => onChange("email", e.target.value)}
        />
        {errors.email && <p className={errorClass}>{errors.email}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className={labelClass}>
          Phone Number <span className="text-rose-400">*</span>
        </label>
        <input
          type="tel"
          className={`${inputClass} mt-1.5`}
          placeholder="(555) 000-0000"
          value={formData.phone}
          onChange={(e) => onChange("phone", e.target.value)}
        />
        {errors.phone && <p className={errorClass}>{errors.phone}</p>}
      </div>

      {/* Mailing address */}
      <div>
        <label className={labelClass}>
          Mailing Address <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          className={`${inputClass} mt-1.5`}
          placeholder="123 Main St, Chicago, IL 60601"
          value={formData.mailingAddress}
          onChange={(e) => onChange("mailingAddress", e.target.value)}
        />
        {errors.mailingAddress && (
          <p className={errorClass}>{errors.mailingAddress}</p>
        )}
      </div>

      {/* Church name */}
      <div>
        <label className={labelClass}>
          Church Name{" "}
          <span className="text-stone-500 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          className={`${inputClass} mt-1.5`}
          placeholder="Grace Community Church"
          value={formData.churchName}
          onChange={(e) => onChange("churchName", e.target.value)}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Step 2 — Location
// ─────────────────────────────────────────────

function Step2({
  formData,
  onChange,
  errors,
}: {
  formData: FormData;
  onChange: (field: keyof FormData, value: string) => void;
  errors: Partial<Record<keyof FormData, string>>;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl text-stone-50 mb-1">
          Where are you located?
        </h2>
        <p className="text-sm text-stone-500 leading-relaxed">
          Select the city where your ministry is based. We&apos;ll connect you
          with the right cohort and local LINC team.
        </p>
      </div>

      {/* City dropdown */}
      <div>
        <label className={labelClass}>
          Choose Your City <span className="text-rose-400">*</span>
        </label>
        <div className="relative mt-1.5">
          <select
            className={selectClass}
            value={formData.city}
            onChange={(e) => onChange("city", e.target.value)}
          >
            <option value="" disabled>
              Select a city...
            </option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {/* Custom chevron */}
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg
              className="w-4 h-4 text-stone-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19 9-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {errors.city && <p className={errorClass}>{errors.city}</p>}
      </div>

      {/* Cohort dropdown */}
      <div>
        <label className={labelClass}>
          Which 2026 Cohort Are You Applying For?{" "}
          <span className="text-rose-400">*</span>
        </label>
        <div className="relative mt-1.5">
          <select
            className={selectClass}
            value={formData.cohort}
            onChange={(e) => onChange("cohort", e.target.value)}
          >
            <option value="" disabled>
              Select a cohort...
            </option>
            {COHORTS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg
              className="w-4 h-4 text-stone-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19 9-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {errors.cohort && <p className={errorClass}>{errors.cohort}</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Ministry Type card
// ─────────────────────────────────────────────

const ministryTypeIcons: Record<string, ReactNode> = {
  Church: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 0A2.25 2.25 0 0 1 14.25 7.5H9.75A2.25 2.25 0 0 1 12 5.25Zm0 0V3m6.364 2.636-1.591 1.591M5.636 5.636 7.227 7.227M21 12h-2.25M3 12H.75m18.364 6.364-1.591-1.591M5.636 18.364l1.591-1.591M12 21v-2.25m0 0a2.25 2.25 0 0 1-2.25-2.25h4.5A2.25 2.25 0 0 1 12 18.75Z" />
    </svg>
  ),
  Nonprofit: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  ),
  Business: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
    </svg>
  ),
  Ministry: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
};

// ─────────────────────────────────────────────
// Step 3 — Ministry
// ─────────────────────────────────────────────

function Step3({
  formData,
  onChange,
  errors,
}: {
  formData: FormData;
  onChange: (field: keyof FormData, value: string) => void;
  errors: Partial<Record<keyof FormData, string>>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl text-stone-50 mb-1">
          Tell us about your work
        </h2>
        <p className="text-sm text-stone-500">
          Help us understand your ministry or venture.
        </p>
      </div>

      {/* Ministry name */}
      <div>
        <label className={labelClass}>
          Ministry / Venture Name{" "}
          <span className="text-stone-500 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          className={`${inputClass} mt-1.5`}
          placeholder="Hope Kitchen"
          value={formData.ministryName}
          onChange={(e) => onChange("ministryName", e.target.value)}
        />
        <p className={helperClass}>
          If you haven&apos;t decided on a name yet, type &quot;Still working on
          it.&quot;
        </p>
      </div>

      {/* Website */}
      <div>
        <label className={labelClass}>
          Ministry Website{" "}
          <span className="text-stone-500 font-normal">(optional)</span>
        </label>
        <input
          type="url"
          className={`${inputClass} mt-1.5`}
          placeholder="https://hopekitchen.org"
          value={formData.ministryWebsite}
          onChange={(e) => onChange("ministryWebsite", e.target.value)}
        />
        <p className={helperClass}>
          If you don&apos;t have a website, type &quot;no website&quot;
        </p>
      </div>

      {/* Ministry Type — featured field */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <label className={`${labelClass}`}>
            Ministry Type <span className="text-rose-400">*</span>
          </label>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-semibold text-amber-400 uppercase tracking-wide">
            <svg
              className="w-2.5 h-2.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 1ZM5.05 3.05a.75.75 0 0 1 1.06 0l1.062 1.06A.75.75 0 1 1 6.11 5.173L5.05 4.11a.75.75 0 0 1 0-1.06ZM14.95 3.05a.75.75 0 0 1 0 1.06l-1.06 1.062a.75.75 0 0 1-1.062-1.061l1.061-1.061a.75.75 0 0 1 1.061 0ZM3 9.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 3 9.25ZM14.75 9.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75ZM6.172 14.828a.75.75 0 0 1-1.061-1.06l1.06-1.062a.75.75 0 0 1 1.062 1.061l-1.061 1.061ZM13.828 13.767a.75.75 0 0 1 1.061 1.061l-1.06 1.062a.75.75 0 0 1-1.062-1.061l1.061-1.062ZM10 14.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75Z"
                clipRule="evenodd"
              />
            </svg>
            Required by leadership
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {MINISTRY_TYPES.map((type) => {
            const isSelected = formData.ministryType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => onChange("ministryType", type)}
                className={`relative group flex flex-col items-start gap-2 rounded-xl p-4 border cursor-pointer transition-all text-left ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/5"
                    : "bg-stone-800/60 border-stone-700 hover:border-stone-600 hover:bg-stone-800"
                }`}
              >
                {/* Check badge */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-stone-900"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`transition-colors ${
                    isSelected ? "text-amber-400" : "text-stone-500 group-hover:text-stone-400"
                  }`}
                >
                  {ministryTypeIcons[type]}
                </div>

                {/* Label */}
                <span
                  className={`text-sm font-semibold transition-colors ${
                    isSelected ? "text-amber-300" : "text-stone-300 group-hover:text-stone-200"
                  }`}
                >
                  {type}
                </span>
              </button>
            );
          })}
        </div>
        {errors.ministryType && (
          <p className={errorClass}>{errors.ministryType}</p>
        )}
      </div>

      {/* Ministry description */}
      <div>
        <label className={labelClass}>
          Tell us about your ministry, venture, or business{" "}
          <span className="text-rose-400">*</span>
        </label>
        <textarea
          rows={4}
          className={`${inputClass} mt-1.5 resize-none`}
          placeholder="Describe your work..."
          value={formData.ministryDescription}
          onChange={(e) => onChange("ministryDescription", e.target.value)}
        />
        <p className={helperClass}>
          What problem are you solving? Who is your target audience?
        </p>
        {errors.ministryDescription && (
          <p className={errorClass}>{errors.ministryDescription}</p>
        )}
      </div>

      {/* Faith story */}
      <div>
        <label className={labelClass}>
          Briefly share your faith story{" "}
          <span className="text-rose-400">*</span>
        </label>
        <textarea
          rows={4}
          className={`${inputClass} mt-1.5 resize-none`}
          placeholder="Share your walk with God..."
          value={formData.faithStory}
          onChange={(e) => onChange("faithStory", e.target.value)}
        />
        <p className={helperClass}>
          This is also known as a testimony — what your walk with God has been.
          If you don&apos;t have a faith story, type &quot;no faith story.&quot;
        </p>
        {errors.faithStory && (
          <p className={errorClass}>{errors.faithStory}</p>
        )}
      </div>

      {/* Gospel experience */}
      <div>
        <label className={labelClass}>
          How would people experience the Gospel through your venture?{" "}
          <span className="text-rose-400">*</span>
        </label>
        <textarea
          rows={4}
          className={`${inputClass} mt-1.5 resize-none`}
          placeholder="Describe how the Gospel is central to what you do..."
          value={formData.gospelExperience}
          onChange={(e) => onChange("gospelExperience", e.target.value)}
        />
        {errors.gospelExperience && (
          <p className={errorClass}>{errors.gospelExperience}</p>
        )}
      </div>

      {/* Program goals */}
      <div>
        <label className={labelClass}>
          What are you hoping to get out of this program?{" "}
          <span className="text-rose-400">*</span>
        </label>
        <textarea
          rows={4}
          className={`${inputClass} mt-1.5 resize-none`}
          placeholder="E.g., marketing help, fundraising, accountability, networking, community"
          value={formData.programGoals}
          onChange={(e) => onChange("programGoals", e.target.value)}
        />
        <p className={helperClass}>
          E.g., marketing help, fundraising, accountability, networking,
          community
        </p>
        {errors.programGoals && (
          <p className={errorClass}>{errors.programGoals}</p>
        )}
      </div>

      {/* How did you hear */}
      <div>
        <label className={labelClass}>
          How did you hear about this program?{" "}
          <span className="text-stone-500 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          className={`${inputClass} mt-1.5`}
          placeholder="A friend, social media, church announcement..."
          value={formData.hearAbout}
          onChange={(e) => onChange("hearAbout", e.target.value)}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Step 4 — Agreement
// ─────────────────────────────────────────────

function Step4({
  formData,
  onChange,
  errors,
}: {
  formData: FormData;
  onChange: (field: keyof FormData, value: string) => void;
  errors: Partial<Record<keyof FormData, string>>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl text-stone-50 mb-1">
          One more thing
        </h2>
        <p className="text-sm text-stone-500 leading-relaxed">
          Please read and acknowledge the following before submitting.
        </p>
      </div>

      {/* Legal text box */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 overflow-y-auto max-h-52">
        <pre className="text-xs text-stone-400 whitespace-pre-wrap font-sans leading-relaxed">
          {LEGAL_TEXT}
        </pre>
      </div>

      {/* Agreement cards */}
      <div className="space-y-3">
        <label className={labelClass}>
          Do you agree to these terms?{" "}
          <span className="text-rose-400">*</span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          {/* I Agree */}
          <button
            type="button"
            onClick={() => onChange("agreement", "agree")}
            className={`flex items-center gap-3 rounded-xl p-4 border cursor-pointer transition-all text-left ${
              formData.agreement === "agree"
                ? "bg-emerald-500/10 border-emerald-500/60 shadow-lg shadow-emerald-500/5"
                : "bg-stone-800/60 border-stone-700 hover:border-stone-600 hover:bg-stone-800"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                formData.agreement === "agree"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-stone-700 text-stone-500"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            </div>
            <span
              className={`text-sm font-semibold transition-colors ${
                formData.agreement === "agree"
                  ? "text-emerald-300"
                  : "text-stone-400"
              }`}
            >
              I Agree
            </span>
          </button>

          {/* I Disagree */}
          <button
            type="button"
            onClick={() => onChange("agreement", "disagree")}
            className={`flex items-center gap-3 rounded-xl p-4 border cursor-pointer transition-all text-left ${
              formData.agreement === "disagree"
                ? "bg-rose-500/10 border-rose-500/60"
                : "bg-stone-800/60 border-stone-700 hover:border-stone-600 hover:bg-stone-800"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                formData.agreement === "disagree"
                  ? "bg-rose-500/20 text-rose-400"
                  : "bg-stone-700 text-stone-500"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </div>
            <span
              className={`text-sm font-semibold transition-colors ${
                formData.agreement === "disagree"
                  ? "text-rose-300"
                  : "text-stone-400"
              }`}
            >
              I Disagree
            </span>
          </button>
        </div>

        {formData.agreement === "disagree" && (
          <div className="flex items-start gap-2.5 bg-rose-500/8 border border-rose-500/20 rounded-lg px-4 py-3">
            <svg
              className="w-4 h-4 text-rose-400 mt-0.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
            <p className="text-xs text-rose-300 leading-relaxed">
              You must agree to the terms to submit your application.
            </p>
          </div>
        )}

        {errors.agreement && (
          <p className={errorClass}>{errors.agreement}</p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Step 5 — Review
// ─────────────────────────────────────────────

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-2.5 border-b border-stone-800 last:border-0">
      <span className="text-xs text-stone-500 w-36 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-stone-200 leading-relaxed flex-1 break-words">
        {value || <span className="text-stone-600 italic">Not provided</span>}
      </span>
    </div>
  );
}

function ReviewSection({
  title,
  step,
  onEdit,
  children,
}: {
  title: string;
  step: number;
  onEdit: (step: number) => void;
  children: ReactNode;
}) {
  return (
    <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-stone-200">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer transition-colors font-medium"
        >
          Edit
        </button>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Step5({
  formData,
  onEdit,
}: {
  formData: FormData;
  onEdit: (step: number) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl text-stone-50 mb-1">
          Review your application
        </h2>
        <p className="text-sm text-stone-500 leading-relaxed">
          Take a moment to confirm everything looks right. You can go back to
          make changes.
        </p>
      </div>

      <ReviewSection title="Contact Information" step={1} onEdit={onEdit}>
        <ReviewRow label="First Name" value={formData.firstName} />
        <ReviewRow label="Last Name" value={formData.lastName} />
        <ReviewRow label="Email" value={formData.email} />
        <ReviewRow label="Phone" value={formData.phone} />
        <ReviewRow label="Mailing Address" value={formData.mailingAddress} />
        <ReviewRow label="Church Name" value={formData.churchName} />
      </ReviewSection>

      <ReviewSection title="Location" step={2} onEdit={onEdit}>
        <ReviewRow label="City" value={formData.city} />
        <ReviewRow label="Cohort" value={formData.cohort} />
      </ReviewSection>

      <ReviewSection title="Ministry" step={3} onEdit={onEdit}>
        <ReviewRow label="Ministry Name" value={formData.ministryName} />
        <ReviewRow label="Website" value={formData.ministryWebsite} />
        <ReviewRow label="Ministry Type" value={formData.ministryType} />
        <ReviewRow label="Description" value={formData.ministryDescription} />
        <ReviewRow label="Faith Story" value={formData.faithStory} />
        <ReviewRow label="Gospel Impact" value={formData.gospelExperience} />
        <ReviewRow label="Program Goals" value={formData.programGoals} />
        <ReviewRow label="Heard About" value={formData.hearAbout} />
      </ReviewSection>

      <ReviewSection title="Agreement" step={4} onEdit={onEdit}>
        <ReviewRow
          label="Legal Agreement"
          value={
            formData.agreement === "agree"
              ? "Agreed"
              : formData.agreement === "disagree"
              ? "Disagreed"
              : ""
          }
        />
      </ReviewSection>
    </div>
  );
}

// ─────────────────────────────────────────────
// Confirmation screen
// ─────────────────────────────────────────────

function ConfirmationScreen({ firstName, email }: { firstName: string; email: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-8">
      {/* Checkmark */}
      <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center">
        <svg
          className="w-9 h-9 text-amber-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4.5 12.75 6 6 9-13.5"
          />
        </svg>
      </div>

      {/* Heading */}
      <div>
        <h1 className="font-[family-name:var(--font-instrument-serif)] text-4xl sm:text-5xl text-stone-50 mb-3">
          Application Submitted
        </h1>
        <p className="text-stone-400 text-base leading-relaxed max-w-sm mx-auto">
          Thank you, {firstName || "friend"}. We&apos;ve received your
          application and will be in touch.
        </p>
      </div>

      {/* What happens next */}
      <div className="w-full bg-stone-900/60 border border-stone-800 rounded-2xl p-5 text-left">
        <h3 className="text-sm font-semibold text-stone-200 mb-3">
          What happens next:
        </h3>
        <ul className="space-y-2.5">
          {[
            "The LINC team will review your application",
            "Your city's leader will reach out to you directly",
            "Expect to hear back within 1–2 weeks",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-amber-400">
                  {i + 1}
                </span>
              </div>
              <span className="text-sm text-stone-300 leading-relaxed">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Email callout */}
      {email && (
        <div className="flex items-center gap-2 text-sm text-stone-400">
          <svg
            className="w-4 h-4 text-stone-500 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
            />
          </svg>
          We&apos;ll be in touch at{" "}
          <span className="text-stone-200 font-medium">{email}</span>
        </div>
      )}

      {/* Contact note */}
      <p className="text-xs text-stone-600">
        Questions? Reach out to{" "}
        <a
          href="mailto:linc@linc.org"
          className="text-stone-500 hover:text-amber-400 transition-colors"
        >
          linc@linc.org
        </a>
      </p>

      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-300 transition-colors mt-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        Back to Impact360
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────

type Errors = Partial<Record<keyof FormData, string>>;

function validateStep(step: number, formData: FormData): Errors {
  // DEMO MODE: validation disabled for click-through demos. Re-enable before deploying.
  return {};
  const errors: Errors = {}; // eslint-disable-line no-unreachable

  if (step === 1) {
    if (!formData.firstName.trim()) errors.firstName = "First name is required.";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required.";
    if (!formData.email.trim()) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Please enter a valid email address.";
    if (!formData.phone.trim()) errors.phone = "Phone number is required.";
    if (!formData.mailingAddress.trim())
      errors.mailingAddress = "Mailing address is required.";
  }

  if (step === 2) {
    if (!formData.city) errors.city = "Please select a city.";
    if (!formData.cohort) errors.cohort = "Please select a cohort.";
  }

  if (step === 3) {
    if (!formData.ministryType)
      errors.ministryType = "Please select a ministry type.";
    if (!formData.ministryDescription.trim())
      errors.ministryDescription =
        "Please describe your ministry or venture.";
    if (!formData.faithStory.trim())
      errors.faithStory = "Please share your faith story.";
    if (!formData.gospelExperience.trim())
      errors.gospelExperience = "This field is required.";
    if (!formData.programGoals.trim())
      errors.programGoals = "Please share what you hope to get out of the program.";
  }

  if (step === 4) {
    if (!formData.agreement)
      errors.agreement = "Please indicate whether you agree or disagree.";
    if (formData.agreement === "disagree")
      errors.agreement =
        "You must agree to the terms to submit your application.";
  }

  return errors;
}

// ─────────────────────────────────────────────
// Main page component
// ─────────────────────────────────────────────

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const totalSteps = 5;

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleContinue = () => {
    const stepErrors = validateStep(currentStep, formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    if (currentStep < totalSteps) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setErrors({});
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleEdit = (step: number) => {
    setErrors({});
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    // Final validation on step 5 still runs step 4 agreement check
    const step4Errors = validateStep(4, formData);
    if (Object.keys(step4Errors).length > 0) {
      setErrors(step4Errors);
      setCurrentStep(4);
      return;
    }
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const canSubmit =
    formData.agreement === "agree";

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      {/* Grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative flex-1 flex flex-col items-center px-4 py-12 sm:py-16">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center">
              <span className="text-stone-900 font-bold text-sm">I3</span>
            </div>
            <span className="text-stone-400 text-sm font-medium group-hover:text-stone-300 transition-colors">
              Impact360
            </span>
          </Link>
        </div>

        {/* Main content card */}
        <div className="w-full max-w-[640px]">
          {submitted ? (
            <ConfirmationScreen
              firstName={formData.firstName}
              email={formData.email}
            />
          ) : (
            <>
              {/* Progress */}
              <ProgressIndicator
                currentStep={currentStep}
                totalSteps={totalSteps}
              />

              {/* Step card */}
              <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-6 sm:p-8 mb-6">
                {currentStep === 1 && (
                  <Step1
                    formData={formData}
                    onChange={handleChange}
                    errors={errors}
                  />
                )}
                {currentStep === 2 && (
                  <Step2
                    formData={formData}
                    onChange={handleChange}
                    errors={errors}
                  />
                )}
                {currentStep === 3 && (
                  <Step3
                    formData={formData}
                    onChange={handleChange}
                    errors={errors}
                  />
                )}
                {currentStep === 4 && (
                  <Step4
                    formData={formData}
                    onChange={handleChange}
                    errors={errors}
                  />
                )}
                {currentStep === 5 && (
                  <Step5 formData={formData} onEdit={handleEdit} />
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between gap-4">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="border border-stone-700 text-stone-400 hover:border-stone-600 hover:text-stone-300 transition-colors px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                  >
                    Back
                  </button>
                ) : (
                  <Link
                    href="/"
                    className="border border-stone-700 text-stone-400 hover:border-stone-600 hover:text-stone-300 transition-colors px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                  >
                    Cancel
                  </Link>
                )}

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="bg-amber-500 text-stone-900 font-semibold hover:bg-amber-400 transition-colors px-6 py-2.5 rounded-xl text-sm cursor-pointer"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className={`font-semibold transition-colors px-6 py-2.5 rounded-xl text-sm ${
                      canSubmit
                        ? "bg-amber-500 text-stone-900 hover:bg-amber-400 cursor-pointer"
                        : "bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700"
                    }`}
                  >
                    Submit Application
                  </button>
                )}
              </div>

              {/* Step counter */}
              <p className="text-center text-xs text-stone-700 mt-5">
                Step {currentStep} of {totalSteps}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
