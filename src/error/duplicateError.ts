// src/error/duplicateError.ts
export const handlerDuplicateError = (err: any) => {
  // Default response
  const response = {
    statusCode: 400,
    message: "Duplicate entry found",
    errorSources: [] as any[],
  };

  // Check if err exists and has necessary properties
  if (!err) {
    return response;
  }

  // Handle MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    // Try to extract duplicate field information
    let duplicateFields: string[] = [];
    let duplicateValues: any[] = [];

    // Method 1: Check keyValue
    if (err.keyValue && typeof err.keyValue === "object") {
      duplicateFields = Object.keys(err.keyValue);
      duplicateValues = Object.values(err.keyValue);
    }

    // Method 2: Check keyPattern
    if (err.keyPattern && typeof err.keyPattern === "object") {
      duplicateFields = Object.keys(err.keyPattern);
    }

    // Method 3: Parse error message as fallback
    if (duplicateFields.length === 0 && err.message) {
      // Try to extract from error message
      const match = err.message.match(/index:\s+(\w+)_/);
      if (match) {
        duplicateFields = [match[1]];
      }
    }

    // Build user-friendly message based on duplicate fields
    if (duplicateFields.length > 0) {
      if (
        duplicateFields.includes("listing") &&
        duplicateFields.includes("user")
      ) {
        response.message =
          "You have already reviewed this listing. Each user can only submit one review per listing.";
      } else if (duplicateFields.includes("email")) {
        response.message =
          "This email is already registered. Please use a different email or login.";
      } else if (duplicateFields.length === 1) {
        const field = duplicateFields[0];
        const value = duplicateValues[0] || "";
        response.message = `The ${field} '${value}' is already in use. Please choose a different ${field}.`;
      } else {
        response.message = `Duplicate entry for fields: ${duplicateFields.join(
          ", "
        )}`;
      }
    }

    // Build error sources array
    duplicateFields.forEach((field, index) => {
      response.errorSources.push({
        path: field,
        message: `${field} must be unique`,
      });
    });
  }

  return response;
};
