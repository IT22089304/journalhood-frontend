"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"

export default function RequestDemoPage() {
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      // TODO: wire to backend or email service
      await new Promise((r) => setTimeout(r, 800))
      alert("Thanks! We'll get back to you within 24 hours.")
      ;(e.target as HTMLFormElement).reset()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Request a Free Demo</h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Experience how Journalhood can transform mental health support at your institution. Fill out the form below
            and we'll get back to you within 24 hours.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input required name="firstName" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input required name="lastName" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name *</label>
              <input required name="institution" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Email *</label>
              <input required type="email" name="email" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input required name="phone" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role/Position</label>
              <input name="role" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Students</label>
              <select name="students" className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select range</option>
                <option>1 - 100</option>
                <option>101 - 500</option>
                <option>501 - 1,000</option>
                <option>1,001 - 5,000</option>
                <option>5,000+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
              <textarea name="message" rows={5} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Tell us about your institution's mental health support needs..." />
            </div>

            <div className="pt-2">
              <Button disabled={submitting} className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500">
                {submitting ? "Submitting..." : "Request Demo"}
              </Button>
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-indigo-600 hover:underline">Back To Home</Link>
        </div>
      </div>
    </div>
  )
}


