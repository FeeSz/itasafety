import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * Compatibility wrapper for older public surfaces.
 * New code should use Button directly.
 */
export default function CtaButton(props: ButtonProps) {
  return <Button {...props} />;
}
