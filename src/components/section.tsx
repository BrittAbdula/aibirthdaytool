interface SectionProps {
    id?: string;
    title?: string;
    subtitle?: string;
    description?: string;
    children?: React.ReactNode;
    className?: string;
  }
  
  export default function Section({
    id,
    title,
    subtitle,
    description,
    children,
    className,
  }: SectionProps) {
    const sectionId = title ? title.toLowerCase().replace(/\s+/g, "-") : id;
    return (
      <section id={id || sectionId}>
        <div className={className}>
          <div className="relative container mx-auto px-4 py-16 max-w-7xl">
            <div className="text-center space-y-4 pb-6 mx-auto">
              {title && (
                <h2 className="text-sm text-primary/90 font-mono font-medium tracking-[0.2em] uppercase bg-primary/10 w-fit mx-auto px-4 py-1.5 rounded-full">
                  {title}
                </h2>
              )}
              {subtitle && (
                <h3 className="mx-auto mt-6 max-w-xs text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent sm:max-w-none sm:text-4xl md:text-5xl">
                  {subtitle}
                </h3>
              )}
              {description && (
                <p className="mt-6 text-lg leading-8 text-muted-foreground/90 max-w-2xl mx-auto font-light">
                  {description}
                </p>
              )}
            </div>
            {children}
          </div>
        </div>
      </section>
    );
  }
  