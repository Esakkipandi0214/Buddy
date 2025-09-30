'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../firebase'
import Link from 'next/link'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email) {
      setError('Please enter your email')
      return
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    const origin = window.location.origin // e.g., http://localhost:3000 or https://buddy-lac.vercel.app

    setLoading(true)
   try {
//   await sendPasswordResetEmail(auth, email)

     await sendPasswordResetEmail(auth, email, {
      url: origin + '/', // redirect to login page after reset
      handleCodeInApp: true,
    })

  setSuccess('Password reset email sent! Check your inbox(check spam if not in Inbox).')
} catch (err: unknown) {
  console.error(err);

  // Narrow the type
  if (err instanceof Error && 'code' in err) {
    const errorWithCode = err as { code: string };

    if (errorWithCode.code === 'auth/user-not-found') {
      setError('No user found with this email.');
    } else if (errorWithCode.code === 'auth/invalid-email') {
      setError('Invalid email address.');
    } else {
      setError('Failed to send reset email. Please try again.');
    }
  } else {
    setError('Failed to send reset email. Please try again.');
  }
}
 finally {
  setLoading(false)
}
  }

  return (
    <div className="min-h-screen px-4 sm:px-0 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900">
      <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-white/20 border border-purple-700 shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-yellow-300">Forgot Password</CardTitle>
          <CardDescription className="text-center text-gray-300">
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-yellow-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/20 placeholder:text-gray-400 text-white border border-purple-500"
              />
            </div>
            {error && <p className="text-sm text-yellow-300 bg-red-700/50 p-2 rounded">{error}</p>}
            {success && <p className="text-sm text-yellow-300 bg-green-700/50 p-2 rounded">{success}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-500 to-purple-700 hover:from-yellow-600 hover:to-purple-800 text-white font-bold py-2 px-4 rounded transition-all duration-200"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-300">
            Remembered your password?{" "}
            <Link href="/" className="text-yellow-300 hover:underline font-semibold">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
