import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CatalogSearchProps = {
  value: string;
  onValueChange: (value: string) => void;
  resultCount: number;
  inputId?: string;
};

export default function CatalogSearch({
  value,
  onValueChange,
  resultCount,
  inputId = "catalog-search",
}: CatalogSearchProps) {
  const statusId = `${inputId}-status`;

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="text-label font-semibold text-foreground">
        Buscar produtos
      </label>
      <div className="relative mt-2">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-primary"
          aria-hidden
        />
        <Input
          id={inputId}
          type="search"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder="Nome, referência, categoria ou CA informado"
          enterKeyHint="search"
          aria-describedby={statusId}
          className="h-12 pl-11 pr-12"
        />
        {value && (
          <Button
            type="button"
            onClick={() => onValueChange("")}
            aria-label="Limpar busca"
            variant="ghost"
            size="icon-sm"
            className="absolute right-1.5 top-1/2 -translate-y-1/2"
          >
            <X className="size-4" aria-hidden />
          </Button>
        )}
      </div>
      <p id={statusId} className="mt-2 text-body-sm text-foreground-muted" aria-live="polite">
        {resultCount} {resultCount === 1 ? "produto encontrado" : "produtos encontrados"}
      </p>
    </div>
  );
}
