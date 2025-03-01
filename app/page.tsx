import Link from 'next/link';
import { Roboto_Mono } from 'next/font/google';

const robotoMono = Roboto_Mono({ subsets: ['latin'] });

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FDFFA8] p-8">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-16">
        <div className="text-2xl font-bold bg-white px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all">
          Notes App
        </div>
        <div className="flex gap-4">
          <Link 
            href="/login"
            className="bg-[#FF90E8] px-6 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all font-bold"
          >
            Login
          </Link>
          <Link 
            href="/register"
            className="bg-[#98FF98] px-6 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all font-bold"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-6xl font-black mb-6 leading-tight">
              <span className="bg-[#FF90E8] px-4 py-2 border-4 border-black inline-block transform -rotate-2">
                Collaborative
              </span>
              <br />
              <span className="bg-white px-4 py-2 border-4 border-black inline-block mt-2 transform rotate-1">
                Note-Taking
              </span>
              <br />
              <span className="bg-[#98FF98] px-4 py-2 border-4 border-black inline-block mt-2 transform -rotate-1">
                Made Fun!
              </span>
            </h1>
            <p className="text-xl mb-8 font-bold max-w-md">
              Create, share, and collaborate on notes in real-time. Experience the future of note-taking!
            </p>
            <Link 
              href="/notes"
              className="inline-block bg-black text-white px-8 py-4 text-xl font-bold border-4 border-black shadow-[8px_8px_0px_0px_#FF90E8] hover:translate-x-[6px] hover:translate-y-[6px] hover:shadow-none transition-all"
            >
              Start Taking Notes →
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#98FF98] p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-2">
              <h3 className="text-xl font-bold mb-2">Real-Time Collaboration</h3>
              <p>Work together with your team in real-time</p>
            </div>
            <div className="bg-[#FF90E8] p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-2">
              <h3 className="text-xl font-bold mb-2">Auto-Saving</h3>
              <p>Never lose your work with automatic saves</p>
            </div>
            <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
              <h3 className="text-xl font-bold mb-2">Rich Text Editor</h3>
              <p>Format your notes just the way you like</p>
            </div>
            <div className="bg-[#FDFFA8] p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
              <h3 className="text-xl font-bold mb-2">Secure Sharing</h3>
              <p>Share notes with specific team members</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-24 text-center">
          <h2 className="text-4xl font-bold mb-8">
            <span className="bg-white px-4 py-2 border-4 border-black inline-block transform rotate-1">
              Ready to Get Started?
            </span>
          </h2>
          <div className="flex justify-center gap-6">
            <Link 
              href="/register"
              className="bg-[#98FF98] px-8 py-3 text-lg font-bold border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all"
            >
              Create Free Account
            </Link>
            <Link 
              href="/about"
              className="bg-[#FF90E8] px-8 py-3 text-lg font-bold border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-24 pt-12 border-t-4 border-black">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold">Notes App</div>
          <div className="flex gap-8">
            <Link href="/privacy" className="font-bold hover:underline">Privacy</Link>
            <Link href="/terms" className="font-bold hover:underline">Terms</Link>
            <Link href="/contact" className="font-bold hover:underline">Contact</Link>
          </div>
        </div>
        <div className="mt-4 text-sm">
          © 2024 Notes App. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
