// Minimaler classnames-Helfer, damit wir keine externe Abhängigkeit
// nur dafür brauchen.
export default function clsx(
  ...args: Array<string | false | null | undefined>
): string {
  return args.filter(Boolean).join(" ");
}
