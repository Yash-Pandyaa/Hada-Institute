"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";

export function ContactForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        subject: formData.get("subject"),
        message: formData.get("message"),
      }),
    });
    setLoading(false);

    if (!response.ok) {
      toast({
        title: "Message not sent",
        description: "Please check the form and try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Message received",
      description: "The admin dashboard can track contact messages.",
    });
  }

  return (
    <form action={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" required type="email" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" />
        </div>
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" name="subject" />
        </div>
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required />
      </div>
      <Button disabled={loading} type="submit">
        {loading ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
