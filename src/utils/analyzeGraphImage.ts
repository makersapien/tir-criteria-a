// src/utils/analyzeGraphImage.ts
export async function analyzeGraphImage(
    base64: string,
    experiment: "distance" | "magnets"
  ): Promise<{
    isGraph: boolean;
    type: "bar" | "scatter" | "unknown";
    axesLabeled: boolean;
    hasTitle: boolean;
  }> {
    // 🔧 TODO: Use lightweight client-side image heuristics here.
    // For now: Simulate based on filename hack (DEV ONLY)
  
    const dummy = base64.toLowerCase();
  
    if (dummy.includes("scatter")) {
      return {
        isGraph: true,
        type: "scatter",
        axesLabeled: true,
        hasTitle: true,
      };
    } else if (dummy.includes("bar")) {
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
  