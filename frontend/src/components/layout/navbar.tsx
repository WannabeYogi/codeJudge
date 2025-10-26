import { Code, Home, Trophy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Code className="h-6 w-6" />
            <span className="font-bold">Shodh-a-Code</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-4">
            <Link href="/" passHref>
              <Button variant="ghost" size="sm">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link href="/contests" passHref>
              <Button variant="ghost" size="sm">
                <Code className="mr-2 h-4 w-4" />
                Contests
              </Button>
            </Link>
            <Link href="/leaderboard" passHref>
              <Button variant="ghost" size="sm">
                <Trophy className="mr-2 h-4 w-4" />
                Leaderboard
              </Button>
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
