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

  it("resuelve los ids de recursos a nombres cuando el componente recibe un mapa", () => {
    render(
      <ResumenValorHistorial
        valor={{
          descartes: [{ itemId: "abc123", cantidad: 1, motivo: "hoal" }],
          desperfectos: [],
        }}
        nombresPorId={{ abc123: "Tubo de ensayo" }}
      />
    );

    expect(screen.getByText(/Tubo de ensayo/i)).toBeInTheDocument();
  });

  describe("casos base", () => {
    it("muestra un guion cuando no hay valor", () => {
      const { rerender } = render(<ResumenValorHistorial valor={null} />);
      expect(screen.getByText("—")).toBeInTheDocument();

      rerender(<ResumenValorHistorial valor={undefined} />);
      expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("muestra los valores primitivos tal cual", () => {
      render(<ResumenValorHistorial valor="texto plano" />);
      expect(screen.getByText("texto plano")).toBeInTheDocument();
    });

    it("convierte los números a texto", () => {
      render(<ResumenValorHistorial valor={42} />);
      expect(screen.getByText("42")).toBeInTheDocument();
    });
  });

  describe("strings serializados", () => {
    it("desenvuelve un JSON y lo trata como objeto", () => {
      render(<ResumenValorHistorial valor='{"nombre":"Beaker"}' />);

      // La clave se muestra tal cual; el capitalize es solo CSS.
      expect(screen.getByText(/nombre/i)).toBeInTheDocument();
      expect(screen.getByText("Beaker")).toBeInTheDocument();
    });

    it("desenvuelve un array serializado", () => {
      render(<ResumenValorHistorial valor='[{"nombre":"Pipeta"}]' />);

      expect(screen.getByText("Pipeta")).toBeInTheDocument();
    });

    it("deja el string crudo si el JSON está roto", () => {
      render(<ResumenValorHistorial valor='{roto' />);

      expect(screen.getByText("{roto")).toBeInTheDocument();
    });
  });

  describe("arrays", () => {
    it("avisa cuando el array está vacío", () => {
      render(<ResumenValorHistorial valor={[]} />);
      expect(screen.getByText("vacío")).toBeInTheDocument();
    });

    it("lista los primitivos", () => {
      render(<ResumenValorHistorial valor={["uno", "dos"]} />);

      expect(screen.getByText("uno")).toBeInTheDocument();
      expect(screen.getByText("dos")).toBeInTheDocument();
    });

    it("lista los objetos de adentro", () => {
      render(<ResumenValorHistorial valor={[{ nombre: "Matraz" }]} />);

      expect(screen.getByText("Matraz")).toBeInTheDocument();
    });
  });

  describe("nodos de cambio (antes → después)", () => {
    it("muestra el diff de dos valores simples", () => {
      render(<ResumenValorHistorial valor={{ antes: "disponible", despues: "mantenimiento" }} />);

      expect(screen.getByText("disponible")).toBeInTheDocument();
      expect(screen.getByText("→")).toBeInTheDocument();
      expect(screen.getByText("mantenimiento")).toBeInTheDocument();
    });

    it("muestra las cajas de quitado y agregado si algún lado es complejo", () => {
      render(
        <ResumenValorHistorial valor={{ antes: { nombre: "A" }, despues: { nombre: "B" } }} />
      );

      expect(screen.getByText("-")).toBeInTheDocument();
      expect(screen.getByText("+")).toBeInTheDocument();
      expect(screen.getByText("A")).toBeInTheDocument();
      expect(screen.getByText("B")).toBeInTheDocument();
    });

    it("desenvuelve los JSON de cada lado del diff", () => {
      render(<ResumenValorHistorial valor={{ antes: '"10"', despues: '"20"' }} />);

      expect(screen.getByText('"10"')).toBeInTheDocument();
      expect(screen.getByText('"20"')).toBeInTheDocument();
    });

    it("cuando el después es un reporte final lo resume en vez de diffear", () => {
      render(
        <ResumenValorHistorial
          valor={{
            antes: null,
            despues: { descartes: [{ tipo: "material", cantidad: 2 }], desperfectos: [] },
          }}
        />
      );

      expect(screen.getByText(/Descartes/)).toBeInTheDocument();
      // No se dibujan las cajas del diff.
      expect(screen.queryByText("-")).not.toBeInTheDocument();
      expect(screen.queryByText("+")).not.toBeInTheDocument();
    });
  });

  describe("reporte final", () => {
    it("avisa cuando no hubo novedades", () => {
      render(<ResumenValorHistorial valor={{ descartes: [], desperfectos: [] }} />);

      expect(screen.getByText("Sin novedades reportadas.")).toBeInTheDocument();
    });

    it("lista los desperfectos con su motivo", () => {
      render(
        <ResumenValorHistorial
          valor={{ descartes: [], desperfectos: [{ equipoId: "eq-1", motivo: "no enciende" }] }}
        />
      );

      expect(screen.getByText(/Desperfectos/)).toBeInTheDocument();
      expect(screen.getByText(/no enciende/)).toBeInTheDocument();
    });

    it("tolera que descartes y desperfectos no sean arrays", () => {
      render(<ResumenValorHistorial valor={{ descartes: "no-array", desperfectos: null }} />);

      expect(screen.getByText("Sin novedades reportadas.")).toBeInTheDocument();
    });

    it("asume cantidad 1 en un descarte sin cantidad ni motivo", () => {
      render(<ResumenValorHistorial valor={{ descartes: [{ tipo: "material" }], desperfectos: [] }} />);

      expect(screen.getByText("×1")).toBeInTheDocument();
      expect(screen.queryByText(/Motivo:/)).not.toBeInTheDocument();
    });
  });

  describe("objetos genéricos", () => {
    it("avisa cuando el objeto está vacío", () => {
      render(<ResumenValorHistorial valor={{}} />);
      expect(screen.getByText("sin datos")).toBeInTheDocument();
    });

    it("separa las claves camelCase y formatea las fechas ISO", () => {
      render(<ResumenValorHistorial valor={{ fechaVencimiento: "2026-01-15T10:30:00.000Z" }} />);

      expect(screen.getByText(/fecha\s+Vencimiento/i)).toBeInTheDocument();
      // El formato exacto depende del locale del runner.
      expect(screen.getByText(/\d{1,2}\/\d{1,2}\/\d{4}/)).toBeInTheDocument();
    });

    it("usa el email cuando el objeto no tiene nombre", () => {
      render(<ResumenValorHistorial valor={{ responsable: { email: "a@b.com" } }} />);

      expect(screen.getByText("a@b.com")).toBeInTheDocument();
    });

    it("cae al id cuando no hay nombre ni email", () => {
      render(<ResumenValorHistorial valor={{ user: { _id: "507f1f77bcf86cd799439011" } }} />);

      expect(screen.getByText(/507f1f77bcf86cd799439011/)).toBeInTheDocument();
    });
  });
});
