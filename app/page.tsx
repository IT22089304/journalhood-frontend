"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-3 lg:px-6 py-1 relative z-10 bg-white">
        <div className="flex items-center space-x-2">
          <Image src="/images/logo.png" alt="JournalHood" width={112} height={32} priority />
          </div>

        <div className="hidden md:flex items-center space-x-5 text-sm">
          <a href="#home" className="text-blue-500 font-semibold border-b-2 border-blue-500 pb-0.5 transition-all">
            Home
          </a>
          <a href="#features" className="text-gray-600 hover:text-blue-500 font-medium transition-colors">
              Features
          </a>
          <a href="#team" className="text-gray-600 hover:text-blue-500 font-medium transition-colors">
              Team
          </a>
          <a href="#contact" className="text-gray-600 hover:text-blue-500 font-medium transition-colors">
              Contact
          </a>
        </div>

          <div className="flex items-center space-x-2 text-sm">
            <Button
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full font-semibold shadow-lg transition-all"
              onClick={() => (window.location.href = "/webStudent/index.html")}
            >
              Student Login
            </Button>
            <Button
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full font-semibold shadow-lg transition-all"
              onClick={() => (window.location.href = "/login")}
            >
              School Login
            </Button>
          </div>
      </nav>

      {/* Hero Section */}
      <div id="home" className="bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-300 relative overflow-hidden">
        <div className="flex items-center justify-between px-6 lg:px-12 py-16 lg:py-24 relative z-10 min-h-[80vh]">
          <div className="flex-1 max-w-2xl pr-8">
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-8">
              Empowering Student
              <br />
              Voices Through
              <br />
              <span className="text-red-400">AI-Enhanced</span>
              <br />
              <span className="text-red-400">Journaling</span>
                </h1>

            <p className="text-white/90 text-lg lg:text-xl mb-10 leading-relaxed max-w-xl">
              Transform your school's understanding of student needs with our secure digital journaling platform.
              Combining the proven benefits of writing with responsible AI insights to help educators make data-driven
              decisions while protecting student privacy.
            </p>

            {/* CTA buttons removed as requested */}
              </div>

          {/* Journal Interface Illustration */}
          <div className="flex-1 flex justify-center items-center relative">
            <div className="relative">
              {/* Main Journal Interface */}
              <div className="bg-white rounded-3xl p-8 shadow-2xl w-[420px] h-[320px] relative transform rotate-2 hover:rotate-0 transition-transform duration-300">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-blue-600 font-bold text-xl">Bullet Journal</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                </div>

                <div className="text-center mb-6">
                  <span className="text-gray-500 text-sm font-medium">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>

                {/* Calendar */}
                <div className="mb-6">
                  <div className="grid grid-cols-7 gap-1 text-xs mb-2">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                      <div key={`${day}-${idx}`} className="text-gray-400 font-semibold text-center p-1">
                        {day}
              </div>
                    ))}
                    {Array.from({ length: 31 }, (_, i) => {
                      const currentDate = new Date().getDate()
                      const dayNumber = i + 1
                      return (
                        <div
                          key={i}
                          className={`p-1.5 text-center rounded-lg transition-colors text-xs ${
                            dayNumber === currentDate
                              ? "bg-blue-500 text-white font-bold"
                              : dayNumber === currentDate - 5 || dayNumber === currentDate + 2
                                ? "bg-blue-100 text-blue-600 font-semibold"
                                : "text-gray-600"
                          }`}
                        >
                          {dayNumber}
            </div>
                      )
                    })}
                  </div>
                </div>

                {/* Tasks and Notes */}
                <div className="flex space-x-6">
                  <div className="flex-1">
                    <h4 className="text-blue-600 font-bold text-sm mb-3">To Do</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 border-2 border-blue-400 rounded-sm"></div>
                        <div className="h-2 bg-blue-200 rounded-full flex-1"></div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                        <div className="h-2 bg-blue-200 rounded-full flex-1"></div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 border-2 border-blue-400 rounded-sm"></div>
                        <div className="h-2 bg-blue-200 rounded-full w-3/4"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-blue-600 font-bold text-sm mb-3">Notes</h4>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-200 rounded-full"></div>
                      <div className="h-2 bg-gray-200 rounded-full w-4/5"></div>
                      <div className="h-2 bg-gray-200 rounded-full w-3/5"></div>
                      <div className="h-2 bg-gray-200 rounded-full w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Character */}
              <div className="absolute -bottom-12 -right-12">
                <div className="w-28 h-28 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-20 h-20 bg-orange-400 rounded-full flex items-center justify-center">
                    <div className="w-10 h-10 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Plant decoration */}
              <div className="absolute -bottom-16 -left-12">
                <div className="relative">
                  <div className="w-10 h-16 bg-green-500 rounded-t-full"></div>
                  <div className="w-16 h-6 bg-gray-800 rounded-full"></div>
                  <div className="absolute top-2 -left-2 w-4 h-6 bg-green-500 rounded-full transform -rotate-45"></div>
                  <div className="absolute top-1 -right-2 w-4 h-6 bg-green-500 rounded-full transform rotate-45"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhancing Student Expression Section */}
      <section id="features" className="bg-white py-20 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Enhancing <span className="text-blue-600">Student Expression</span> Through Secure
              <br />
              Digital Journaling
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Our innovative platform combines the power of journaling with responsible AI analysis to help schools
              understand and support student needs while maintaining complete privacy.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Privacy-First Journaling */}
            <div className="text-center p-6 hover:bg-gradient-to-br hover:from-blue-400 hover:to-cyan-400 hover:text-white rounded-2xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-blue-500 group-hover:bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-white mb-4 transition-colors duration-300">
                Privacy-First Journaling
              </h3>
              <p className="text-gray-600 group-hover:text-white/90 text-sm leading-relaxed transition-colors duration-300">
                Enterprise-grade security and privacy features protect student journal entries while enabling AI-powered
                insights.
              </p>
            </div>

            <div className="text-center p-6 hover:bg-gradient-to-br hover:from-blue-400 hover:to-cyan-400 hover:text-white rounded-2xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-blue-500 group-hover:bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-white mb-4 transition-colors duration-300">
                Data-Driven Insights
              </h3>
              <p className="text-gray-600 group-hover:text-white/90 text-sm leading-relaxed transition-colors duration-300">
                Our AI analyzes aggregated writing patterns to help schools identify trends, measure engagement, and
                understand areas where additional resources might be needed.
              </p>
            </div>

            {/* Resource Optimization */}
            <div className="text-center p-6 hover:bg-gradient-to-br hover:from-blue-400 hover:to-cyan-400 hover:text-white rounded-2xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-blue-500 group-hover:bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-white mb-4 transition-colors duration-300">
                Resource Optimization
              </h3>
              <p className="text-gray-600 group-hover:text-white/90 text-sm leading-relaxed transition-colors duration-300">
                Make informed decisions about program funding and resource allocation based on comprehensive,
                data-driven insights from student writing patterns.
              </p>
            </div>

            {/* Academic Growth */}
            <div className="text-center p-6 hover:bg-gradient-to-br hover:from-blue-400 hover:to-cyan-400 hover:text-white rounded-2xl transition-all duration-300 group">
              <div className="w-16 h-16 bg-blue-500 group-hover:bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-white mb-4 transition-colors duration-300">
                Academic Growth
              </h3>
              <p className="text-gray-600 group-hover:text-white/90 text-sm leading-relaxed transition-colors duration-300">
                Foster critical thinking, strengthen communication skills, and support overall academic development
                through guided journaling practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Journalhood Works Section */}
      <section className="bg-gray-50 py-20 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              How <span className="text-blue-600">Journalhood</span> Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive digital journaling solution that enhances student expression and academic growth
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* For Students */}
            <div className="bg-white rounded-2xl p-8 hover:bg-gradient-to-br hover:from-blue-400 hover:to-cyan-400 transition-all duration-300 group">
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white mb-8">For Students</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Secure digital journal accessible 24/7
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Writing prompts to boost creativity
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Skill development tracking
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Writing style improvement tips
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Complete privacy protection
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Easy-to-use mobile interface
                  </p>
                </div>
              </div>
            </div>

            {/* For Schools */}
            <div className="bg-white rounded-2xl p-8 hover:bg-gradient-to-br hover:from-blue-400 hover:to-cyan-400 transition-all duration-300 group">
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white mb-8">For Schools</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Writing engagement analytics
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Academic progress tracking
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Resource allocation insights
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Program effectiveness data
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Grade-level performance trends
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Integration with school systems
                  </p>
                </div>
              </div>
            </div>

            {/* Platform Features */}
            <div className="bg-white rounded-2xl p-8 hover:bg-gradient-to-br hover:from-blue-400 hover:to-cyan-400 transition-all duration-300 group">
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white mb-8">Platform Features</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Enterprise-grade security
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Responsible AI analysis
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Real-time data processing
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Customizable reporting
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Comprehensive analytics
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-colors duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Regular feature updates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Making A Real Impact Section */}
      <section className="bg-white py-20 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-12">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Making A <span className="text-blue-600">Real Impact</span> Through
                <br />
                Smart Resource Allocation
              </h2>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                Our comprehensive approach helps schools identify student needs and connect them with the right
                resources at the right time.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Pattern Recognition</h3>
                  <p className="text-gray-600 leading-relaxed">
                    AI-powered analysis identifies common themes and patterns in student writing to understand
                    collective needs.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Resource Connection</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Link identified needs with existing school resources, from academic support to extracurricular
                    activities.
            </p>
          </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Proactive Support</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Identify areas where students might need additional support before issues impact their academic
                    performance.
                  </p>
              </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Resource Optimization</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Help schools allocate resources effectively based on actual student needs and usage patterns.
              </p>
            </div>
              </div>
            </div>

            <div className="flex-1 flex justify-center">
              <Image
                src="/images/Screenshot%202025-08-12%20181433.png"
                alt="Smart resource allocation illustration"
                width={746}
                height={638}
                className="w-full max-w-xl h-auto object-contain"
                priority
              />
                    </div>
          </div>
        </div>
      </section>

      {/* Implementation Process, Support Services, Why Choose Us Section */}
      <section className="bg-gray-50 py-20 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Implementation Process */}
            <div className="hover:bg-gradient-to-br hover:from-blue-400 hover:to-cyan-400 hover:text-white rounded-2xl p-8 transition-all duration-300 group">
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white mb-8 transition-colors duration-300">
                Implementation Process
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Initial consultation and needs assessment
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Customized platform setup
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Staff training and orientation
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Student onboarding support
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Ongoing technical assistance
                  </p>
                </div>
              </div>
            </div>

            <div className="hover:bg-gradient-to-br hover:from-blue-400 hover:to-cyan-400 hover:text-white rounded-2xl p-8 transition-all duration-300 group">
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white mb-8 transition-colors duration-300">
                Support Services
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    24/7 technical support
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Regular platform updates
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Monthly insight reports
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Staff training sessions
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Custom feature development
                  </p>
                </div>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="hover:bg-gradient-to-br hover:from-blue-400 hover:to-cyan-400 hover:text-white rounded-2xl p-8 transition-all duration-300 group">
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white mb-8 transition-colors duration-300">
                Why Choose Us
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Proven impact on student well-being
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Highest privacy standards
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Continuous platform improvement
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Dedicated support team
                  </p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-blue-500 group-hover:bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
                    Flexible partnership models
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section id="team" className="bg-white py-20 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Meet Our <span className="text-blue-600">Team</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experienced professionals dedicated to transforming student mental health support
              </p>
            </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Team Member 1 */}
            <div className="text-center">
              <div className="w-48 h-48 bg-gray-300 rounded-full mx-auto mb-6 overflow-hidden">
                <img
                  src="/images/1.jpg"
                  alt="Murugappan Valliyappan"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Murugappan Valliyappan</h3>
              <p className="text-gray-600 mb-2">Data Product Manager</p>
              <p className="text-blue-600 mb-4">Ex-Snap</p>
              <div className="flex justify-center space-x-4">
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="#" className="text-blue-400 hover:text-blue-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Team Member 2 */}
            <div className="text-center">
              <div className="w-48 h-48 bg-gray-300 rounded-full mx-auto mb-6 overflow-hidden">
                <img
                  src="/images/2.jpeg"
                  alt="Team Member 2"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Lahiru Bandara</h3>
              <p className="text-gray-600 mb-2">Developer</p>
              <p className="text-blue-600 mb-4">JOURNALHOOD</p>
              <div className="flex justify-center space-x-4">
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="#" className="text-blue-400 hover:text-blue-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Team Member 3 */}
            <div className="text-center">
              <div className="w-48 h-48 bg-gray-300 rounded-full mx-auto mb-6 overflow-hidden">
                <img
                  src="/images/3.jpeg"
                  alt="Team Member 3"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Nakul</h3>
              <p className="text-gray-600 mb-2">Developer</p>
              <p className="text-blue-600 mb-4">JOURNALHOOD</p>
              <div className="flex justify-center space-x-4">
                <a href="#" className="text-blue-600 hover:text-blue-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="#" className="text-blue-400 hover:text-blue-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner With Journalhood Section */}
      <section id="contact" className="bg-gray-50 py-20 scroll-mt-24">
        <div className="max-w-4xl mx-auto text-center px-6 lg:px-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Transform Mental Health Support</h2>
          <h3 className="text-3xl lg:text-4xl font-bold text-blue-600 mb-8">
            Partner with Leading Educational Institutions
          </h3>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto">
            Join schools worldwide in providing innovative mental health support that makes a real difference in
            students' lives.
          </p>
          <Link href="/request-demo">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl transition-all inline-flex items-center gap-2">
              Request Free Demo
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
          </Link>
        </div>
      </section>

      
    </div>
  )
}