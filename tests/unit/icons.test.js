import { describe, expect, it } from "vitest";

import "../../assets/js/utils/icons.js";

describe("hskIcons utility", () => {
  it("registers on window.hskIcons and exports ICONS and render", () => {
    expect(window.hskIcons).toBeDefined();
    expect(typeof window.hskIcons.render).toBe("function");
    expect(typeof window.hskIcons.ICONS).toBe("object");
  });

  it("renders a known icon with default options", () => {
    const svg = window.hskIcons.render("home");
    expect(svg).toContain('<svg class="hsk-icon hsk-icon-home"');
    expect(svg).toContain('width="18" height="18"');
    expect(svg).toContain('fill="none"');
    expect(svg).toContain('stroke="currentColor"');
    expect(svg).toContain('stroke-width="2"');
    expect(svg).toContain('aria-hidden="true"');
  });

  it("renders with custom options: size, className, style, fill, stroke, strokeWidth", () => {
    const svg = window.hskIcons.render("star", {
      size: 24,
      className: "custom-star",
      style: "color: gold;",
      fill: "gold",
      stroke: "#f59e0b",
      strokeWidth: 1.5,
    });
    expect(svg).toContain('class="hsk-icon hsk-icon-star custom-star"');
    expect(svg).toContain('width="24" height="24"');
    expect(svg).toContain('style="color: gold;"');
    expect(svg).toContain('fill="gold"');
    expect(svg).toContain('stroke="#f59e0b"');
    expect(svg).toContain('stroke-width="1.5"');
  });

  it("renders with accessible ariaLabel without aria-hidden", () => {
    const svg = window.hskIcons.render("search", {
      ariaLabel: "Buscar vocabulario",
    });
    expect(svg).toContain('aria-label="Buscar vocabulario" role="img"');
    expect(svg).not.toContain('aria-hidden="true"');
  });

  it("falls back to star icon when an unknown icon is requested", () => {
    const svg = window.hskIcons.render("unknown-icon-xyz");
    expect(svg).toContain('class="hsk-icon hsk-icon-unknown-icon-xyz"');
    expect(svg).toContain(window.hskIcons.ICONS.star);
  });

  it("handles null or undefined name safely", () => {
    const svgNull = window.hskIcons.render(null);
    expect(svgNull).toContain('<svg class="hsk-icon hsk-icon-"');
    expect(svgNull).toContain(window.hskIcons.ICONS.star);

    const svgUndefined = window.hskIcons.render();
    expect(svgUndefined).toContain('<svg class="hsk-icon hsk-icon-"');
  });

  it("contains all standard icons in registry", () => {
    const icons = window.hskIcons.ICONS;
    const requiredKeys = [
      "home", "book", "cards", "trophy", "flame", "star", "target", "volume",
      "map", "image", "shirt", "check", "cross", "cloud", "alert-circle", "save"
    ];
    requiredKeys.forEach((key) => {
      expect(icons[key]).toBeDefined();
    });
  });
});
