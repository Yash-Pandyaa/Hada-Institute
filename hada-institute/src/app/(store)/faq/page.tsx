export const metadata = {
  title: "FAQ",
};

const faqs = [
  {
    question: "How are notes delivered?",
    answer:
      "After successful Razorpay payment verification, the PDF appears in the student's purchased notes library.",
  },
  {
    question: "Can a student download the PDF repeatedly?",
    answer:
      "Download limits and expiry are managed through secure DownloadAccess records.",
  },
  {
    question: "Are institute achievements listed here?",
    answer:
      "No. Results, faculty names, branches, testimonials, and achievements stay hidden until official verified sources are added.",
  },
  {
    question: "Can admins update pricing?",
    answer:
      "Yes. Admin users can publish products, update prices, discounts, coupons, and track orders.",
  },
];

export default function FaqPage() {
  return (
    <div className="container-shell py-10">
      <h1 className="text-3xl font-bold tracking-normal">
        Frequently asked questions
      </h1>
      <div className="mt-6 grid gap-4">
        {faqs.map((faq) => (
          <div
            className="rounded-lg border bg-white p-5 shadow-sm"
            key={faq.question}
          >
            <h2 className="font-semibold">{faq.question}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
