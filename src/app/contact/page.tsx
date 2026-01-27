import { Metadata } from "next";
import Button from "@/components/Button";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with me",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-darkest-blue mb-8">Contact</h1>
      <div className="max-w-lg">
        <p className="text-grey-text mb-8">
          Have a question or want to work together? Feel free to reach out!
        </p>
        <form className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-primary-text mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full rounded-md border border-clickable px-4 py-2 focus:border-dark-blue focus:outline-none focus:ring-1 focus:ring-dark-blue"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-primary-text mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full rounded-md border border-clickable px-4 py-2 focus:border-dark-blue focus:outline-none focus:ring-1 focus:ring-dark-blue"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-primary-text mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className="w-full rounded-md border border-clickable px-4 py-2 focus:border-dark-blue focus:outline-none focus:ring-1 focus:ring-dark-blue"
              placeholder="Your message..."
            />
          </div>
          <Button type="submit" variant="primary">
            Send Message
          </Button>
        </form>
      </div>
    </div>
  );
}
