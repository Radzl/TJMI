import Container from './Container';

type PageHeaderProps = {
  title: string;
  intro: string;
};

export default function PageHeader({ title, intro }: PageHeaderProps) {
  return (
    <header className="border-b border-line py-20">
      <Container>
        <h1 className="font-display text-4xl uppercase leading-none tracking-tight text-ink sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
          {intro}
        </p>
      </Container>
    </header>
  );
}
