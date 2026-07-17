type GreetingHeaderProps = {
  name: string;
};

export function GreetingHeader({ name }: GreetingHeaderProps) {
  return (
    <section className="col-span-12">
      <div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface mb-1">
          Assalamu&apos;alaikum <span className="text-2xl">👋</span> <br></br>
          {name}
        </h1>

      </div>
    </section>
  );
}
