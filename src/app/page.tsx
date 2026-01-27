import Button from "@/components/Button";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-darkest-blue sm:text-5xl md:text-6xl">
          Hi, I&apos;m William Portugal
        </h1>
        <p className="mt-4 text-xl text-grey-text">
          Welcome to my portfolio
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="primary">View Projects</Button>
          <Button variant="outline">Contact Me</Button>
        </div>
      </div>
    </div>
  );
}
