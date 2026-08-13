import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      closeButton
      duration={4000}
      gap={10}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-md group-[.toaster]:border-border group-[.toaster]:bg-surface-elevated group-[.toaster]:text-foreground group-[.toaster]:shadow-elevated",
          description: "group-[.toast]:text-foreground-muted",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:border-success/25",
          warning: "group-[.toaster]:border-warning/30",
          error: "group-[.toaster]:border-danger/30",
          info: "group-[.toaster]:border-info/25",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
