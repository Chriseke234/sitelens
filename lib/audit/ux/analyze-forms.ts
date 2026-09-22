import * as cheerio from "cheerio";

export interface FormFieldDetail {
  type: string;
  name?: string;
  id?: string;
  hasAssociatedLabel: boolean;
  isRequired: boolean;
}

export interface FormDetail {
  action?: string;
  method?: string;
  fieldCount: number;
  hasSubmitButton: boolean;
  hasEmailInput: boolean;
  hasPhoneInput: boolean;
  unlabeledInputCount: number;
  fields: FormFieldDetail[];
}

export interface FormAnalysisResult {
  formCount: number;
  hasContactForm: boolean;
  hasSignupForm: boolean;
  totalUnlabeledInputs: number;
  forms: FormDetail[];
  observations: string[];
}

export function analyzeForms($: cheerio.CheerioAPI): FormAnalysisResult {
  const formElements = $("form");
  const formCount = formElements.length;

  let hasContactForm = false;
  let hasSignupForm = false;
  let totalUnlabeledInputs = 0;
  const forms: FormDetail[] = [];
  const observations: string[] = [];

  formElements.each((_, formEl) => {
    const action = $(formEl).attr("action")?.trim();
    const method = ($(formEl).attr("method") || "get").toUpperCase();

    const inputs = $(formEl).find("input, select, textarea");
    const fields: FormFieldDetail[] = [];

    let hasSubmitButton = $(formEl).find("button[type='submit'], input[type='submit'], button:not([type])").length > 0;
    let hasEmailInput = false;
    let hasPhoneInput = false;
    let unlabeledCount = 0;

    inputs.each((_, inputEl) => {
      const type = ($(inputEl).attr("type") || inputEl.name).toLowerCase();
      if (type === "hidden" || type === "submit" || type === "button" || type === "image") {
        return;
      }

      const id = $(inputEl).attr("id");
      const name = $(inputEl).attr("name");
      const ariaLabel = $(inputEl).attr("aria-label");
      const ariaLabelledBy = $(inputEl).attr("aria-labelledby");
      const placeholder = $(inputEl).attr("placeholder");
      const isRequired = $(inputEl).attr("required") !== undefined;

      // Check if explicit <label for="id"> or wrapping <label> exists
      let hasAssociatedLabel = false;
      if (id && $(`label[for="${id}"]`).length > 0) {
        hasAssociatedLabel = true;
      } else if ($(inputEl).closest("label").length > 0) {
        hasAssociatedLabel = true;
      } else if (ariaLabel || ariaLabelledBy) {
        hasAssociatedLabel = true;
      }

      if (!hasAssociatedLabel) {
        unlabeledCount++;
        totalUnlabeledInputs++;
      }

      if (type === "email" || name?.includes("email") || id?.includes("email") || placeholder?.toLowerCase().includes("email")) {
        hasEmailInput = true;
      }
      if (type === "tel" || name?.includes("phone") || id?.includes("phone") || placeholder?.toLowerCase().includes("phone")) {
        hasPhoneInput = true;
      }

      fields.push({
        type,
        name,
        id,
        hasAssociatedLabel,
        isRequired,
      });
    });

    const formText = $(formEl).text().toLowerCase();
    if (formText.includes("contact") || action?.includes("contact") || hasEmailInput) {
      hasContactForm = true;
    }
    if (formText.includes("sign up") || formText.includes("register") || formText.includes("subscribe")) {
      hasSignupForm = true;
    }

    forms.push({
      action,
      method,
      fieldCount: fields.length,
      hasSubmitButton,
      hasEmailInput,
      hasPhoneInput,
      unlabeledInputCount: unlabeledCount,
      fields,
    });
  });

  if (formCount > 0) {
    observations.push(`Detected ${formCount} interactive form container(s).`);
    if (totalUnlabeledInputs > 0) {
      observations.push(`${totalUnlabeledInputs} input field(s) lack an explicit accessible <label> element.`);
    }
  } else {
    observations.push("No HTML <form> elements detected on the page.");
  }

  return {
    formCount,
    hasContactForm,
    hasSignupForm,
    totalUnlabeledInputs,
    forms,
    observations,
  };
}
