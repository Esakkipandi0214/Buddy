'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../../firebase'  // Adjust the path to your firebaseConfig file
import { useRouter } from 'next/router'  // Import useRouter from next/router
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore'
import Link from 'next/link'

export default function Component() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()  // Initialize useRouter
   const [isSignupLoading, setIsSignupLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')  // Clear previous errors
    setSuccess('')  // Clear previous success message
    setIsSignupLoading(true)
    
    if (!name || !email || !password) {
      setError('Please fill in all fields')
      setIsSignupLoading(false)
      return
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      setIsSignupLoading(false)
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsSignupLoading(false)
      return
    }

    try {
      // Check if email already exists in Firestore
      const usersRef = collection(db, 'users')
      const emailQuery = query(usersRef, where('email', '==', email))
      const querySnapshot = await getDocs(emailQuery)

      if (!querySnapshot.empty) {
        setError('Email is already registered. Please use a different email or login.')
        setIsSignupLoading(false)
        return
      }

      // Create a new user with Firebase Authentication if email is not registered
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Store user information in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: email,
        uid: user.uid,
         storageLimit: 500 * 1024 * 1024, // 500 MB in bytes
  usedStorage: 0 // no files uploaded yet
      })

      setError('')
      setSuccess('Account created successfully')
      console.log('Account created successfully')
      setIsSignupLoading(false)

      setTimeout(() => {
        router.push('/')  // Redirect to the scheduler page
      }, 1000)  // Optional delay for success message visibility

    } catch (error) {
      setSuccess('')
      setError('Failed to create an account. Please check your credentials.')
      setIsSignupLoading(false)
      console.error('Registration error:', error)
    }
  }

  return (
    <div className="min-h-screen px-4 sm:px-0 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-900">
  <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-white/20 border border-purple-700 shadow-2xl">
    <CardHeader className="space-y-1">
      <CardTitle className="text-2xl font-bold text-center text-yellow-300">Create Account</CardTitle>
      <CardDescription className="text-center text-gray-300">
        Enter your details to create a new account
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-yellow-300">Name</Label>
          <Input 
            id="name" 
            type="text" 
            placeholder="John Doe" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-white/20 text-white placeholder:text-gray-400 border border-purple-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-yellow-300">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="you@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/20 text-white placeholder:text-gray-400 border border-purple-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-yellow-300">Password</Label>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/20 text-white border border-purple-500"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-yellow-300"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4" />
              ) : (
                <EyeIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        {error && <p className="text-sm text-yellow-300 bg-red-700/50 p-2 rounded">{error}</p>}
        {success && <p className="text-sm text-yellow-300 bg-green-700/50 p-2 rounded">{success}</p>}
        <Button   disabled={isSignupLoading} type="submit" className="w-full bg-gradient-to-r from-yellow-500 to-purple-700 hover:from-yellow-600 hover:to-purple-800 text-white font-bold py-2 px-4 rounded transition-all duration-200">
          {isSignupLoading ? (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  ) : (
    "Create Account"
  )}
        </Button>
      </form>
    </CardContent>
    <CardFooter className="flex justify-center">
      <p className="text-sm text-gray-300">
        Already have an account?{" "}
        <Link href="/" className="text-yellow-300 hover:underline font-semibold">
          Login
        </Link>
      </p>
    </CardFooter>
  </Card>
</div>

  )
}
