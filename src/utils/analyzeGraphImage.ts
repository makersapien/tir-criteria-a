// src/utils/analyzeGraphImage.ts
export async function analyzeGraphImage(
  base64: string,
  learningPath: "critical-angle" | "fiber-optics" // ✅ Updated parameter type
): Promise<{
  isGraph: boolean;
  type: "bar" | "scatter" | "ray-diagram" | "unknown"; // ✅ Added ray-diagram type
  axesLabeled: boolean;
  hasTitle: boolean;
}> {
  // 🔧 TODO: Use lightweight client-side image heuristics for TIR analysis
  // For now: Simulate based on content analysis (DEV ONLY)

  const dummy = base64.toLowerCase();

  // Check for TIR-specific diagram types
  if (dummy.includes("ray") || dummy.includes("light") || dummy.includes("beam")) {
    return {
      isGraph: true,
      type: "ray-diagram",
      axesLabeled: true,
      hasTitle: true,
    };
  } else if (dummy.includes("scatter")) {
    return {
      isGraph: true,
      type: "scatter",
      axesLabeled: true,
      hasTitle: true,
    };
  } else if (dummy.includes("bar") || dummy.includes("graph")) {
    return {
      isGraph: true,
      type: "bar",
      axesLabeled: true,
      hasTitle: false,
    };
  } else {
    return {
      isGraph: false,
      type: "unknown",
      axesLabeled: false,
      hasTitle: false,
    };
  }
}