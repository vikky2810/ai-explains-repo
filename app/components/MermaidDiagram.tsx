"use client";

import React, { useEffect, useId, useState } from "react";

let initialized = false;

/**
 * Renders a mermaid diagram. Model-written diagrams sometimes have syntax
 * errors, so a diagram that fails to parse is shown as its source instead.
 */
export function MermaidDiagram({ chart }: { chart: string }) {
  const id = `mermaid-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [svg, setSvg] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        if (!initialized) {
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: "strict",
            suppressErrorRendering: true,
            theme: "base",
            themeVariables: {
              darkMode: true,
              background: "#0B0B0C",
              primaryColor: "#141416",
              primaryBorderColor: "#A3E635",
              primaryTextColor: "#E7E7E3",
              lineColor: "#6E6E68",
              fontFamily: "var(--font-geist), ui-sans-serif, system-ui, sans-serif",
              fontSize: "14px",
            },
          });
          initialized = true;
        }
        await mermaid.parse(chart);
        const { svg } = await mermaid.render(id, chart);
        // Mermaid scales the SVG to the container, which makes wide diagrams
        // unreadably small; render at natural width and let the box scroll
        const naturalWidth = svg.match(/viewBox="[\d.-]+ [\d.-]+ ([\d.]+)/)?.[1];
        const sized = naturalWidth
          ? svg.replace(/width="100%"/, `width="${Math.ceil(Number(naturalWidth))}"`).replace(/max-width:\s*[\d.]+px;?/, "")
          : svg;
        if (!cancelled) setSvg(sized);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, id]);

  if (failed) {
    return (
      <pre className="mb-3 overflow-x-auto rounded-md border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-400 last:mb-0">
        {chart}
      </pre>
    );
  }

  if (!svg) {
    return <div className="mb-3 h-24 animate-pulse rounded-md bg-slate-900 last:mb-0" aria-hidden="true" />;
  }

  return (
    <div
      role="img"
      aria-label="Flow diagram of how the project works"
      className="mb-3 overflow-x-auto rounded-md border border-slate-800 bg-slate-950 p-4 last:mb-0 [&_svg]:mx-auto [&_svg]:max-w-none"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
