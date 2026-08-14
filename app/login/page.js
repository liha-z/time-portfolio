import { login, signup } from './action'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-24">
      <form className="flex flex-col w-64 gap-4">
        <label htmlFor="email">Email:</label>
        <input id="email" name="email" type="email" required className="border p-2 text-black" />
        
        <label htmlFor="password">Password:</label>
        <input id="password" name="password" type="password" required className="border p-2 text-black" />
        
        <div className="flex gap-2 mt-4">
          <button formAction={login} className="bg-blue-600 text-white p-2 rounded w-full hover:bg-blue-700">Log In</button>
          <button formAction={signup} className="bg-gray-600 text-white p-2 rounded w-full hover:bg-gray-700">Sign Up</button>
        </div>
      </form>
    </main>
  )
}
