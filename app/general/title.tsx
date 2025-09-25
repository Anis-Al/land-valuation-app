import type { PropsWithChildren } from 'react';

export type TitleProps = PropsWithChildren<{
  subtitle?: string;
}>;

export function Title({ subtitle, children }: TitleProps) {
  const mainHeader = (
    <h1 className="text-2xl font-bold tracking-tight">{children}</h1>
  );

  if (subtitle) {
    return (
      <div className="flex flex-col gap-1">
        {mainHeader}

        <span className="text-muted-foreground text-xs">{subtitle}</span>
      </div>
    );
  } else {
    return mainHeader;
  }
}
