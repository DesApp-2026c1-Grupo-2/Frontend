import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResumenValorHistorial } from "../../utils/historialFormat.jsx";

describe("ResumenValorHistorial", () => {
  it("muestra un resumen legible para descartes y desperfectos", () => {
    render(
      <ResumenValorHistorial
        valor={{
          descartes: [{ tipo: "material", cantidad: 6, motivo: "se calleron" }],
          desperfectos: [],
        }}
      />
    );

    expect(screen.getByText(/Descartes/i)).toBeInTheDocument();
    expect(screen.getByText(/material/i)).toBeInTheDocument();
    expect(screen.getByText(/se calleron/i)).toBeInTheDocument();
  });
});
