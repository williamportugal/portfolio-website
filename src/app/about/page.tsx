import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about me and my background",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-darkest-blue mb-8">About Me</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-grey-text">
          This is the about page. Add your bio and background information here.
        </p>
      </div>
    </div>
  );
}
